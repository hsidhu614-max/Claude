export type SourceLanguage = "punjabi" | "english";

export interface TranslateResponse {
  sourceLanguage: SourceLanguage;
  transcription: string;
  translation: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function translateAudio(
  sourceLanguage: SourceLanguage,
  audioBlob: Blob,
): Promise<TranslateResponse> {
  const audioBase64 = await blobToBase64(audioBlob);

  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceLanguage,
      audioBase64,
      mimeType: audioBlob.type || "audio/webm",
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Translation request failed (${response.status})`);
  }

  return response.json();
}
