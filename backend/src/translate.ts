import { Router, type Request, type Response } from "express";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import Anthropic from "@anthropic-ai/sdk";

export const translateRouter = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CLAUDE_MODEL = "claude-sonnet-4-5";

type SourceLanguage = "punjabi" | "english";

interface TranslateRequestBody {
  sourceLanguage: SourceLanguage;
  audioBase64: string;
  mimeType: string;
}

const SYSTEM_PROMPT = `You are an expert Punjabi-English translator working in a real-time face-to-face conversation app. You will be given a transcript of speech and the language it was spoken in. Translate it into the other language (Punjabi -> English, or English -> Punjabi).

Rules:
- Preserve the speaker's meaning, tone, and register naturally; prefer how a native speaker would actually say it in conversation over a stiff literal translation.
- If the source is Punjabi, write the Punjabi transcript in Gurmukhi script (correcting obvious transcription errors where the intent is clear) and produce a natural, conversational English translation.
- If the source is English, produce a natural, conversational Punjabi translation written in Gurmukhi script.
- Do not add commentary, explanations, notes, or quotation marks. Output only the requested fields.
- Respond with ONLY a JSON object of the form {"transcription": string, "translation": string} and nothing else - no markdown fences, no prose.`;

function extensionForMimeType(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  return "webm";
}

function extractJson(text: string): { transcription: string; translation: string } {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : trimmed;
  const parsed = JSON.parse(jsonText);
  if (typeof parsed.transcription !== "string" || typeof parsed.translation !== "string") {
    throw new Error("Malformed translation response from Claude");
  }
  return { transcription: parsed.transcription, translation: parsed.translation };
}

translateRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { sourceLanguage, audioBase64, mimeType } = req.body as Partial<TranslateRequestBody>;

    if (!sourceLanguage || (sourceLanguage !== "punjabi" && sourceLanguage !== "english")) {
      return res.status(400).json({ error: "sourceLanguage must be 'punjabi' or 'english'" });
    }
    if (!audioBase64 || typeof audioBase64 !== "string") {
      return res.status(400).json({ error: "audioBase64 is required" });
    }
    if (!mimeType || typeof mimeType !== "string") {
      return res.status(400).json({ error: "mimeType is required" });
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");
    const extension = extensionForMimeType(mimeType);
    const audioFile = await toFile(audioBuffer, `audio.${extension}`, { type: mimeType });

    const whisperResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: sourceLanguage === "punjabi" ? "pa" : "en",
    });

    const rawTranscript = whisperResponse.text.trim();

    if (!rawTranscript) {
      return res.status(422).json({ error: "No speech detected in the recording" });
    }

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Source language: ${sourceLanguage}\nTranscript: ${rawTranscript}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const { transcription, translation } = extractJson(textBlock.text);

    res.json({ sourceLanguage, transcription, translation });
  } catch (error) {
    console.error("Translate error:", error);
    res.status(500).json({ error: "Failed to translate audio" });
  }
});
