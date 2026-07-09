import { Mic, Square } from "lucide-react";

interface MicButtonProps {
  isRecording: boolean;
  isDisabled: boolean;
  isBusy: boolean;
  onClick: () => void;
}

export function MicButton({ isRecording, isDisabled, isBusy, onClick }: MicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      className={`relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        isRecording ? "bg-red-500/80 border-red-300" : "hover:bg-white/20 active:bg-white/25"
      }`}
    >
      {isRecording && (
        <span className="absolute inset-0 rounded-full animate-ping bg-red-400/50" />
      )}
      {isBusy ? (
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      ) : isRecording ? (
        <Square className="h-10 w-10 fill-current" strokeWidth={1.5} />
      ) : (
        <Mic className="h-12 w-12" strokeWidth={1.5} />
      )}
    </button>
  );
}
