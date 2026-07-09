import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { AutoFitText } from "./AutoFitText";
import { MicButton } from "./MicButton";

interface LanguageHalfProps {
  variant: "punjabi" | "english";
  text: string;
  isRecording: boolean;
  isDisabled: boolean;
  isBusy: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onMicTap: () => void;
  onReplay: () => void;
}

const COPY = {
  punjabi: {
    bg: "bg-[#C05A3E]",
    label: "ਪੰਜਾਬੀ ਵਿੱਚ ਬੋਲੋ",
    labelClassName: "font-gurmukhi text-2xl",
    placeholder: "ਬੋਲਣ ਲਈ ਮਾਈਕ ਦਬਾਓ",
    rotated: true,
  },
  english: {
    bg: "bg-[#2D4A53]",
    label: "Speak in English",
    labelClassName: "text-xl tracking-wide",
    placeholder: "Tap the mic to speak",
    rotated: false,
  },
} as const;

export function LanguageHalf({
  variant,
  text,
  isRecording,
  isDisabled,
  isBusy,
  isMuted,
  onToggleMute,
  onMicTap,
  onReplay,
}: LanguageHalfProps) {
  const copy = COPY[variant];

  return (
    <div
      className={`relative h-1/2 w-full overflow-hidden ${copy.bg} text-[#F5EDE7] ${
        copy.rotated ? "rotate-180" : ""
      }`}
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {text && (
          <button
            type="button"
            onClick={onReplay}
            aria-label="Replay"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
          </button>
        )}
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Volume2 className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <div className="flex h-full w-full flex-col items-center justify-between px-6 py-6">
        <div className="flex w-full min-h-0 flex-1 items-center justify-center">
          {text ? (
            <AutoFitText
              text={text}
              className="w-full h-full flex items-center justify-center text-center"
              maxFontSize={40}
              minFontSize={16}
            />
          ) : (
            <p className="text-center text-base text-white/50">{copy.placeholder}</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 pb-2">
          <MicButton
            isRecording={isRecording}
            isDisabled={isDisabled}
            isBusy={isBusy}
            onClick={onMicTap}
          />
          <span className={copy.labelClassName}>{copy.label}</span>
        </div>
      </div>
    </div>
  );
}
