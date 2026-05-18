"use client";

interface Props {
  percentWatched: number;
}

export function VideoProgressBar({ percentWatched }: Props) {
  return (
    <div
      className="h-[3px] overflow-hidden w-full"
      style={{ background: "rgba(200,184,130,0.3)" }}
    >
      <div
        className="h-full transition-all duration-500"
        style={{
          width: `${Math.min(percentWatched, 100)}%`,
          background: percentWatched >= 90 ? "#059669" : "#C0392B",
        }}
      />
    </div>
  );
}
