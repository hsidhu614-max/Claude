import { useLayoutEffect, useRef, useState } from "react";

interface AutoFitTextProps {
  text: string;
  className?: string;
  maxFontSize?: number;
  minFontSize?: number;
}

export function AutoFitText({
  text,
  className = "",
  maxFontSize = 40,
  minFontSize = 16,
}: AutoFitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const fit = () => {
      let size = maxFontSize;
      textEl.style.fontSize = `${size}px`;

      while (
        size > minFontSize &&
        (textEl.scrollHeight > container.clientHeight ||
          textEl.scrollWidth > container.clientWidth)
      ) {
        size -= 1;
        textEl.style.fontSize = `${size}px`;
      }

      setFontSize(size);
    };

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(container);

    return () => observer.disconnect();
  }, [text, maxFontSize, minFontSize]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div
        ref={textRef}
        style={{ fontSize: `${fontSize}px` }}
        className="leading-tight break-words text-center"
      >
        {text}
      </div>
    </div>
  );
}
