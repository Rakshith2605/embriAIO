"use client";

// Layers: node y-positions per layer
const LAYERS: number[][] = [
  [90, 175, 260],
  [55, 130, 205, 280],
  [55, 130, 205, 280],
  [120, 225],
];
const LAYER_X = [72, 202, 332, 432];
const NODE_R = 7;

// Build every adjacent-layer connection with a staggered animation delay
function buildConnections() {
  const out: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = [];
  let i = 0;
  for (let l = 0; l < LAYERS.length - 1; l++) {
    for (const y1 of LAYERS[l]) {
      for (const y2 of LAYERS[l + 1]) {
        out.push({ x1: LAYER_X[l], y1, x2: LAYER_X[l + 1], y2, delay: (i * 0.18) % 3 });
        i++;
      }
    }
  }
  return out;
}

const CONNECTIONS = buildConnections();

// Per-layer node colours (violet → indigo spectrum)
const NODE_FILLS = [
  { inner: "#a78bfa", outer: "#7c3aed" }, // violet
  { inner: "#818cf8", outer: "#4338ca" }, // indigo
  { inner: "#818cf8", outer: "#4338ca" }, // indigo
  { inner: "#c084fc", outer: "#7e22ce" }, // purple
];

export function NeuralNetSVG() {
  return (
    <svg viewBox="0 0 504 340" aria-hidden className="w-full h-full">
      <defs>
        {NODE_FILLS.map((c, i) => (
          <radialGradient key={i} id={`ng${i}`} cx="38%" cy="35%">
            <stop offset="0%" stopColor={c.inner} />
            <stop offset="100%" stopColor={c.outer} />
          </radialGradient>
        ))}

        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        <style>{`
          @keyframes flowRight {
            0%   { stroke-dashoffset: 80; opacity: 0.08; }
            40%  { opacity: 0.45; }
            100% { stroke-dashoffset: 0;  opacity: 0.08; }
          }
          @keyframes nodePulse {
            0%, 100% { opacity: 0.70; }
            50%       { opacity: 1.00; }
          }
          @keyframes ringPulse {
            0%, 100% { opacity: 0.12; r: 13; }
            50%       { opacity: 0.28; r: 16; }
          }
          .conn {
            stroke-dasharray: 7 12;
            animation: flowRight 2.8s linear infinite;
          }
          .nd { animation: nodePulse 2.2s ease-in-out infinite alternate; }
          .nr { animation: ringPulse 2.2s ease-in-out infinite alternate; }
        `}</style>
      </defs>

      {/* Connections */}
      {CONNECTIONS.map((c, i) => (
        <line
          key={i}
          x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
          stroke="rgba(139,92,246,0.3)"
          strokeWidth="1.2"
          className="conn"
          style={{ animationDelay: `${c.delay}s` }}
        />
      ))}

      {/* Nodes */}
      {LAYERS.map((ys, li) =>
        ys.map((y, ni) => {
          const delay = `${((li * 0.4 + ni * 0.55) % 2.2).toFixed(2)}s`;
          return (
            <g key={`${li}-${ni}`} filter="url(#glow)">
              {/* Glow ring */}
              <circle
                cx={LAYER_X[li]} cy={y} r={13}
                fill={NODE_FILLS[li].outer}
                className="nr"
                style={{ animationDelay: delay }}
              />
              {/* Core */}
              <circle
                cx={LAYER_X[li]} cy={y} r={NODE_R}
                fill={`url(#ng${li})`}
                className="nd"
                style={{ animationDelay: delay }}
              />
            </g>
          );
        })
      )}
    </svg>
  );
}
