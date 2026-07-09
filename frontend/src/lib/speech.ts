import type { SourceLanguage } from "./api";

const LANG_CODES: Record<SourceLanguage, string> = {
  punjabi: "pa-IN",
  english: "en-US",
};

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split("-")[0]))
  );
}

export function speak(text: string, language: SourceLanguage) {
  if (!text || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const lang = LANG_CODES[language];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;

  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
