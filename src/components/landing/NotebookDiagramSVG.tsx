"use client";

export function NotebookDiagramSVG() {
  return (
    <svg
      viewBox="0 0 460 340"
      aria-hidden
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Graph paper pattern */}
        <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="rgba(180,160,100,0.22)"
            strokeWidth="0.5"
          />
        </pattern>

        <style>{`
          @keyframes drawPath {
            from { stroke-dashoffset: 800; }
            to   { stroke-dashoffset: 0; }
          }
          .draw-path {
            stroke-dasharray: 800;
            animation: drawPath 2.5s ease-out forwards;
          }
          @keyframes pulseDot {
            0%,100% { r: 3; opacity: 0.8; }
            50%      { r: 5; opacity: 1; }
          }
          .pulse-dot {
            animation: pulseDot 1.8s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* Background */}
      <rect width="460" height="340" fill="#FFFDF5" />

      {/* Graph paper overlay */}
      <rect width="460" height="340" fill="url(#grid)" />

      {/* Top label */}
      <text
        x="18"
        y="24"
        fontFamily="Georgia,serif"
        fontStyle="italic"
        fontSize="11"
        fill="#8B7355"
      >
        fig. 1 — training dynamics
      </text>

      {/* ── Loss curve axes ── */}

      {/* x-axis */}
      <line x1="55" y1="260" x2="420" y2="260" stroke="#1C1610" strokeWidth="1" />
      {/* y-axis */}
      <line x1="55" y1="260" x2="55" y2="50" stroke="#1C1610" strokeWidth="1" />

      {/* y-axis label */}
      <text x="42" y="55" fontFamily="monospace" fontSize="10" fill="#5C4E35" textAnchor="middle">
        L
      </text>

      {/* x-axis label */}
      <text x="430" y="263" fontFamily="monospace" fontSize="10" fill="#5C4E35">
        epoch
      </text>

      {/* x-axis tick marks and epoch numbers */}
      {[0, 1, 2, 3, 4, 5, 6].map((n) => {
        const x = 55 + n * 60;
        return (
          <g key={n}>
            <line x1={x} y1="260" x2={x} y2="265" stroke="#1C1610" strokeWidth="0.8" />
            <text
              x={x}
              y="275"
              fontFamily="monospace"
              fontSize="9"
              fill="#5C4E35"
              textAnchor="middle"
            >
              {n}
            </text>
          </g>
        );
      })}

      {/* Training loss curve (hand-drawn cubic bezier) */}
      <path
        d="M 55 248 C 90 210, 130 158, 180 130 C 220 114, 270 106, 320 101 C 360 98, 400 96, 418 95"
        stroke="#1C1610"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="draw-path"
      />

      {/* Validation loss curve (slightly higher, dashed) */}
      <path
        d="M 55 252 C 92 218, 135 168, 185 142 C 226 126, 276 122, 326 124 C 366 125, 404 127, 420 128"
        stroke="#C0392B"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="draw-path"
      />

      {/* Legend */}
      <line x1="270" y1="52" x2="290" y2="52" stroke="#1C1610" strokeWidth="1.5" />
      <text x="294" y="55" fontFamily="monospace" fontSize="9" fill="#1C1610">
        train
      </text>
      <line
        x1="270"
        y1="66"
        x2="290"
        y2="66"
        stroke="#C0392B"
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />
      <text x="294" y="69" fontFamily="monospace" fontSize="9" fill="#C0392B">
        val
      </text>

      {/* Pulsing dot at end of training loss curve */}
      <circle cx="418" cy="95" fill="#1C1610" className="pulse-dot">
        <animate
          attributeName="r"
          values="3;5;3"
          dur="1.8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;1;0.8"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Attention equation */}
      <text
        x="230"
        y="302"
        fontFamily="Georgia,serif"
        fontStyle="italic"
        fontSize="12"
        fill="#1C1610"
        textAnchor="middle"
      >
        Attention(Q,K,V) = softmax( QK&#7488; /&#8730;d&#8342; ) · V
      </text>

      {/* Rotated annotation in rust */}
      <text
        transform="rotate(-6, 350, 160)"
        x="280"
        y="165"
        fontFamily="monospace"
        fontSize="9.5"
        fill="#C0392B"
        opacity="0.85"
      >
        no black boxes, we promise →
      </text>
    </svg>
  );
}
