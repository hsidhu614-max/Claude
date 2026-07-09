import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageHalf } from "./components/LanguageHalf";
import { useRecorder } from "./lib/useRecorder";
import { translateAudio, type SourceLanguage } from "./lib/api";
import { cancelSpeech, speak } from "./lib/speech";

function App() {
  const recorder = useRecorder();

  const [activeSide, setActiveSide] = useState<SourceLanguage | null>(null);
  const [processingSide, setProcessingSide] = useState<SourceLanguage | null>(null);
  const [punjabiText, setPunjabiText] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [mutedPunjabi, setMutedPunjabi] = useState(false);
  const [mutedEnglish, setMutedEnglish] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = useCallback((message: string) => {
    setError(message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setError(null), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      cancelSpeech();
    };
  }, []);

  const handleMicTap = useCallback(
    async (side: SourceLanguage) => {
      if (processingSide) return;

      if (activeSide === side) {
        setActiveSide(null);
        setProcessingSide(side);
        try {
          const blob = await recorder.stop();
          const result = await translateAudio(side, blob);

          if (side === "punjabi") {
            setPunjabiText(result.transcription);
            setEnglishText(result.translation);
            if (!mutedEnglish) speak(result.translation, "english");
          } else {
            setEnglishText(result.transcription);
            setPunjabiText(result.translation);
            if (!mutedPunjabi) speak(result.translation, "punjabi");
          }
        } catch (err) {
          console.error(err);
          showError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
          setProcessingSide(null);
        }
        return;
      }

      if (activeSide === null) {
        try {
          await recorder.start();
          setActiveSide(side);
        } catch (err) {
          console.error(err);
          showError("Microphone access is required");
        }
      }
    },
    [activeSide, processingSide, recorder, mutedPunjabi, mutedEnglish, showError],
  );

  const handleReplay = useCallback(
    (side: SourceLanguage) => {
      const text = side === "punjabi" ? punjabiText : englishText;
      speak(text, side);
    },
    [punjabiText, englishText],
  );

  const handleToggleMute = useCallback((side: SourceLanguage) => {
    if (side === "punjabi") {
      setMutedPunjabi((prev) => !prev);
    } else {
      setMutedEnglish((prev) => !prev);
    }
    cancelSpeech();
  }, []);

  return (
    <div className="relative h-dvh w-screen overflow-hidden flex flex-col select-none">
      <LanguageHalf
        variant="punjabi"
        text={punjabiText}
        isRecording={activeSide === "punjabi"}
        isDisabled={processingSide !== null || (activeSide !== null && activeSide !== "punjabi")}
        isBusy={processingSide === "punjabi"}
        isMuted={mutedPunjabi}
        onToggleMute={() => handleToggleMute("punjabi")}
        onMicTap={() => handleMicTap("punjabi")}
        onReplay={() => handleReplay("punjabi")}
      />

      <div className="h-px w-full bg-black" />

      <LanguageHalf
        variant="english"
        text={englishText}
        isRecording={activeSide === "english"}
        isDisabled={processingSide !== null || (activeSide !== null && activeSide !== "english")}
        isBusy={processingSide === "english"}
        isMuted={mutedEnglish}
        onToggleMute={() => handleToggleMute("english")}
        onMicTap={() => handleMicTap("english")}
        onReplay={() => handleReplay("english")}
      />

      {error && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center">
          <div className="rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
