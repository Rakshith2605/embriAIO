"use client";

import { useState, useEffect } from "react";

const GRAPH_PAPER = (id: string) => (
  <defs>
    <pattern id={id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(180,160,100,0.18)" strokeWidth="0.5" />
    </pattern>
  </defs>
);

const BG = ({ id }: { id: string }) => (
  <>
    {GRAPH_PAPER(id)}
    <rect width="480" height="340" fill="#FFFDF5" />
    <rect width="480" height="340" fill={`url(#${id})`} />
  </>
);

const FIG = ({ n, title }: { n: number; title: string }) => (
  <text x="16" y="22" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#C0392B">
    fig. {n} — {title}
  </text>
);

// Shared axis helpers
const Axis = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1C1610" strokeWidth="1" />
);

// ── 1. Training dynamics ─────────────────────────────────────────────────────
function Viz1() {
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g1" />
      <FIG n={1} title="training dynamics" />
      <Axis x1={55} y1={270} x2={440} y2={270} />
      <Axis x1={55} y1={270} x2={55} y2={45} />
      <text x="38" y="50" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="middle">loss</text>
      <text x="448" y="273" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35">epoch</text>
      {[0,1,2,3,4,5,6,7].map(n => (
        <g key={n}>
          <line x1={55+n*52} y1="270" x2={55+n*52} y2="275" stroke="#1C1610" strokeWidth="0.7" />
          <text x={55+n*52} y="284" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#8B7355" textAnchor="middle">{n}</text>
        </g>
      ))}
      {[0,1,2,3,4].map(n => (
        <g key={n}>
          <line x1="50" y1={270-n*50} x2="55" y2={270-n*50} stroke="#1C1610" strokeWidth="0.7" />
          <text x="44" y={274-n*50} fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#8B7355" textAnchor="end">{(n*0.5).toFixed(1)}</text>
        </g>
      ))}
      <path d="M55,262 C90,220 130,165 185,138 C230,118 285,108 340,103 C380,100 420,98 437,97" stroke="#1C1610" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M55,265 C92,226 138,175 193,151 C238,135 293,132 348,136 C388,139 425,143 440,145" stroke="#C0392B" strokeWidth="1.4" strokeDasharray="5 3" fill="none" strokeLinecap="round" />
      <line x1="285" y1="55" x2="310" y2="55" stroke="#1C1610" strokeWidth="1.8" />
      <text x="314" y="58" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#1C1610">train</text>
      <line x1="285" y1="70" x2="310" y2="70" stroke="#C0392B" strokeWidth="1.4" strokeDasharray="5 3" />
      <text x="314" y="73" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#C0392B">val</text>
      <line x1="348" y1="136" x2="348" y2="103" stroke="#8B7355" strokeWidth="0.8" strokeDasharray="3 2" />
      <text x="352" y="122" fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#8B7355">gap</text>
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">L(θ) = −𝔼[log p(x|θ)]</text>
    </svg>
  );
}

// ── 2. Gradient descent contour ───────────────────────────────────────────────
function Viz2() {
  const contours = [
    { rx: 120, ry: 75, opacity: 0.13 },
    { rx: 90, ry: 56, opacity: 0.18 },
    { rx: 62, ry: 38, opacity: 0.24 },
    { rx: 38, ry: 23, opacity: 0.32 },
    { rx: 18, ry: 11, opacity: 0.45 },
  ];
  const cx = 240, cy = 170;
  const path = "M148,105 C175,128 195,145 210,158 C220,166 228,170 235,171";
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g2" />
      <FIG n={2} title="gradient descent contour" />
      {contours.map((c, i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={c.rx} ry={c.ry} fill="none" stroke="#1C1610" strokeWidth="0.8" opacity={c.opacity} />
      ))}
      <ellipse cx={cx} cy={cy} rx={6} ry={6} fill="#C0392B" opacity={0.9} />
      <text x={cx+8} y={cy+4} fontFamily="Georgia,serif" fontStyle="italic" fontSize="10" fill="#C0392B">θ*</text>
      <path d={path} stroke="#C0392B" strokeWidth="1.6" fill="none" strokeLinecap="round" markerEnd="url(#arr2)" />
      <defs>
        <marker id="arr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#C0392B" />
        </marker>
      </defs>
      {["θ₀","θ₁","θ₂","θ₃","θ₄"].map((label, i) => {
        const pts = [[148,105],[175,128],[195,145],[210,158],[235,171]] as [number,number][];
        return <circle key={i} cx={pts[i][0]} cy={pts[i][1]} r="3" fill="#1C1610" opacity={0.6} />;
      })}
      <text x="140" y="98" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35">θ₀</text>
      <Axis x1={80} y1={290} x2={400} y2={290} />
      <Axis x1={80} y1={290} x2={80} y2={40} />
      <text x="408" y="293" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35">w₁</text>
      <text x="70" y="37" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35">w₂</text>
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">θₜ₊₁ = θₜ − η ∇L(θₜ)</text>
    </svg>
  );
}

// ── 3. Learning rate finder ───────────────────────────────────────────────────
function Viz3() {
  // LR finder: loss goes down then up as LR increases
  const points: [number,number][] = [
    [60,240],[90,235],[120,225],[155,208],[190,185],[225,160],[260,140],[295,128],[325,122],[350,125],[370,135],[390,158],[410,195],[430,240]
  ];
  const polyline = points.map(p => p.join(",")).join(" ");
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g3" />
      <FIG n={3} title="learning rate finder" />
      <Axis x1={55} y1={270} x2={445} y2={270} />
      <Axis x1={55} y1={270} x2={55} y2={50} />
      <text x="38" y="55" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="middle">loss</text>
      <text x="250" y="303" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="middle">learning rate (log scale)</text>
      {["1e-5","1e-4","1e-3","1e-2","1e-1"].map((label, i) => {
        const x = 80 + i*82;
        return (
          <g key={i}>
            <line x1={x} y1="270" x2={x} y2="276" stroke="#1C1610" strokeWidth="0.7" />
            <text x={x} y="286" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#8B7355" textAnchor="middle">{label}</text>
          </g>
        );
      })}
      <polyline points={polyline} stroke="#1C1610" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      {/* Optimal LR marker */}
      <line x1="325" y1="50" x2="325" y2="270" stroke="#C0392B" strokeWidth="1" strokeDasharray="4 3" />
      <text x="327" y="68" fontFamily="Georgia,serif" fontStyle="italic" fontSize="10" fill="#C0392B">optimal η</text>
      <circle cx="325" cy="122" r="4" fill="#C0392B" />
      {/* Shaded "good" region */}
      <rect x="260" y="50" width="120" height="220" fill="#C0392B" opacity="0.05" />
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">pick η just before loss diverges</text>
    </svg>
  );
}

// ── 4. Overfitting ────────────────────────────────────────────────────────────
function Viz4() {
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g4" />
      <FIG n={4} title="overfitting — bias–variance tradeoff" />
      <Axis x1={55} y1={270} x2={440} y2={270} />
      <Axis x1={55} y1={270} x2={55} y2={50} />
      <text x="38" y="55" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="middle">error</text>
      <text x="250" y="295" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="middle">model complexity →</text>
      {/* Train error — monotonically decreasing */}
      <path d="M65,230 C110,200 160,165 210,138 C260,112 310,92 360,78 C390,70 420,64 438,62" stroke="#1C1610" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Val error — U-shaped */}
      <path d="M65,235 C110,208 160,180 210,162 C250,149 280,148 310,153 C345,160 385,178 420,202 C430,210 436,218 440,225" stroke="#C0392B" strokeWidth="1.6" strokeDasharray="5 3" fill="none" strokeLinecap="round" />
      {/* Sweet spot */}
      <line x1="265" y1="50" x2="265" y2="270" stroke="#8B7355" strokeWidth="0.9" strokeDasharray="3 2" />
      <text x="268" y="65" fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#8B7355">sweet spot</text>
      {/* Regions */}
      <text x="100" y="310" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#5C4E35" textAnchor="middle">high bias</text>
      <text x="380" y="310" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#C0392B" textAnchor="middle">high variance</text>
      <line x1="270" y1="55" x2="290" y2="55" stroke="#1C1610" strokeWidth="1.8" />
      <text x="294" y="58" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#1C1610">train</text>
      <line x1="270" y1="70" x2="290" y2="70" stroke="#C0392B" strokeWidth="1.6" strokeDasharray="5 3" />
      <text x="294" y="73" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#C0392B">val</text>
    </svg>
  );
}

// ── 5. Attention heatmap ──────────────────────────────────────────────────────
function Viz5() {
  const tokens = ["The","cat","sat","on","mat"];
  const weights = [
    [0.85,0.05,0.03,0.04,0.03],
    [0.12,0.72,0.08,0.04,0.04],
    [0.05,0.18,0.68,0.06,0.03],
    [0.04,0.05,0.10,0.74,0.07],
    [0.06,0.04,0.10,0.12,0.68],
  ];
  const cellSize = 48;
  const ox = 100, oy = 55;
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g5" />
      <FIG n={5} title="self-attention weights" />
      {weights.map((row, i) => row.map((w, j) => (
        <rect key={`${i}-${j}`} x={ox+j*cellSize} y={oy+i*cellSize} width={cellSize-1} height={cellSize-1}
          fill={`rgba(192,57,43,${w})`} stroke="rgba(180,160,100,0.3)" strokeWidth="0.5" />
      )))}
      {weights.map((row, i) => row.map((w, j) => (
        <text key={`t${i}-${j}`} x={ox+j*cellSize+cellSize/2} y={oy+i*cellSize+cellSize/2+4}
          fontFamily="'JetBrains Mono',monospace" fontSize="9" fill={w>0.4?"#FFFDF5":"#1C1610"} textAnchor="middle">
          {w.toFixed(2)}
        </text>
      )))}
      {tokens.map((t, i) => (
        <text key={`r${i}`} x={ox-6} y={oy+i*cellSize+cellSize/2+4} fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="end">{t}</text>
      ))}
      {tokens.map((t, i) => (
        <text key={`c${i}`} x={ox+i*cellSize+cellSize/2} y={oy-8} fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">{t}</text>
      ))}
      <text x="240" y="315" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">softmax(QKᵀ/√dₖ) — each row sums to 1</text>
    </svg>
  );
}

// ── 6. Transformer block ──────────────────────────────────────────────────────
function Viz6() {
  const box = (x: number, y: number, w: number, h: number, label: string, sub?: string, highlight = false) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={highlight ? "rgba(192,57,43,0.08)" : "#F7F2E7"}
        stroke={highlight ? "#C0392B" : "#C8B882"} strokeWidth={highlight ? 1.5 : 1} />
      <text x={x+w/2} y={y+h/2+(sub?-4:5)} fontFamily="'JetBrains Mono',monospace" fontSize="10" fill="#1C1610" textAnchor="middle">{label}</text>
      {sub && <text x={x+w/2} y={y+h/2+10} fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#8B7355" textAnchor="middle">{sub}</text>}
    </g>
  );
  const arrow = (x: number, y1: number, y2: number) => (
    <line x1={x} y1={y1} x2={x} y2={y2} stroke="#5C4E35" strokeWidth="1" markerEnd="url(#arr6)" />
  );
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr6" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#5C4E35" />
        </marker>
        <pattern id="g6" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(180,160,100,0.18)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="480" height="340" fill="#FFFDF5" />
      <rect width="480" height="340" fill="url(#g6)" />
      <FIG n={6} title="transformer block" />
      {/* Input */}
      <text x="240" y="318" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="middle">x (input embedding)</text>
      {arrow(240, 305, 278)}
      {/* Layer norm 1 */}
      {box(165, 278, 150, 28, "LayerNorm")}
      {arrow(240, 252, 248)}
      {/* MHA */}
      {box(155, 210, 170, 42, "Multi-Head Attention", "h=8, dₖ=64", true)}
      {/* Residual 1 */}
      <path d="M155,290 C128,290 128,230 155,230" stroke="#C0392B" strokeWidth="1" fill="none" strokeDasharray="3 2" />
      <text x="108" y="262" fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#C0392B">+</text>
      {arrow(240, 175, 172)}
      {box(165, 145, 150, 28, "LayerNorm")}
      {arrow(240, 118, 115)}
      {box(155, 73, 170, 42, "Feed-Forward", "d_ff = 4 × d_model", true)}
      {/* Residual 2 */}
      <path d="M155,157 C128,157 128,95 155,95" stroke="#C0392B" strokeWidth="1" fill="none" strokeDasharray="3 2" />
      <text x="108" y="128" fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#C0392B">+</text>
      {arrow(240, 36, 33)}
      <text x="240" y="30" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="middle">output</text>
    </svg>
  );
}

// ── 7. Residual connection ────────────────────────────────────────────────────
function Viz7() {
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g7" />
      <FIG n={7} title="residual connection — gradient highway" />
      {/* Main path */}
      <line x1="240" y1="300" x2="240" y2="250" stroke="#1C1610" strokeWidth="1.2" />
      <rect x="190" y="215" width="100" height="35" fill="#F7F2E7" stroke="#C8B882" strokeWidth="1" />
      <text x="240" y="237" fontFamily="'JetBrains Mono',monospace" fontSize="10" fill="#1C1610" textAnchor="middle">F(x) — layer</text>
      <line x1="240" y1="215" x2="240" y2="155" stroke="#1C1610" strokeWidth="1.2" />
      {/* Skip */}
      <path d="M240,300 C160,300 160,125 240,125" stroke="#C0392B" strokeWidth="1.4" fill="none" strokeDasharray="5 3" />
      {/* Sum node */}
      <circle cx="240" cy="125" r="14" fill="#FFFDF5" stroke="#C0392B" strokeWidth="1.5" />
      <text x="240" y="130" fontFamily="Georgia,serif" fontStyle="italic" fontSize="14" fill="#C0392B" textAnchor="middle">+</text>
      <line x1="240" y1="111" x2="240" y2="75" stroke="#1C1610" strokeWidth="1.2" />
      <text x="240" y="65" fontFamily="'JetBrains Mono',monospace" fontSize="10" fill="#5C4E35" textAnchor="middle">H(x) = F(x) + x</text>
      {/* Labels */}
      <text x="170" y="290" fontFamily="Georgia,serif" fontStyle="italic" fontSize="10" fill="#5C4E35">x</text>
      <text x="156" y="175" fontFamily="Georgia,serif" fontStyle="italic" fontSize="10" fill="#C0392B">skip</text>
      {/* Gradient flow annotation */}
      <text x="300" y="175" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#8B7355">∂L/∂x flows</text>
      <text x="300" y="188" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#8B7355">unchanged via +</text>
      {/* Why it helps */}
      <text x="240" y="318" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">solves vanishing gradient in deep nets</text>
    </svg>
  );
}

// ── 8. BPE tokenization ───────────────────────────────────────────────────────
function Viz8() {
  const steps = [
    { text: "l o w e r", label: "characters" },
    { text: "lo w e r", label: "merge: l+o" },
    { text: "lo we r", label: "merge: w+e" },
    { text: "lower", label: "merge: lowe+r" },
  ];
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g8" />
      <FIG n={8} title="byte-pair encoding (BPE)" />
      {steps.map((s, i) => {
        const y = 75 + i*58;
        const tokens = s.text.split(" ");
        const colors = ["#1C1610","#C0392B","#5C4E35","#8B7355","#1C1610"];
        let xOff = 100;
        return (
          <g key={i}>
            <text x="22" y={y+4} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#8B7355">step {i+1}</text>
            <text x="22" y={y+16} fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#C0392B">{s.label}</text>
            {tokens.map((tok, j) => {
              const tw = tok.length*11+14;
              const el = (
                <g key={j}>
                  <rect x={xOff} y={y-14} width={tw} height={22} fill="#F7F2E7" stroke={j===0 && i>0 ? "#C0392B" : "#C8B882"} strokeWidth={j===0 && i>0 ? 1.5 : 0.8} />
                  <text x={xOff+tw/2} y={y+1} fontFamily="'JetBrains Mono',monospace" fontSize="11" fill={colors[j%5]} textAnchor="middle">{tok}</text>
                </g>
              );
              xOff += tw+4;
              return el;
            })}
            {i < steps.length-1 && (
              <line x1="240" y1={y+10} x2="240" y2={y+46} stroke="#5C4E35" strokeWidth="0.8" markerEnd="url(#arr8)" opacity="0.5" />
            )}
          </g>
        );
      })}
      <defs>
        <marker id="arr8" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#5C4E35" opacity="0.5" />
        </marker>
      </defs>
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">vocab size ↓, coverage ↑ — GPT-4 uses ~100k merges</text>
    </svg>
  );
}

// ── 9. Embedding space ────────────────────────────────────────────────────────
function Viz9() {
  const points: {x:number;y:number;label:string;color:string}[] = [
    {x:130,y:210,label:"man",color:"#1C1610"},
    {x:310,y:215,label:"woman",color:"#C0392B"},
    {x:125,y:115,label:"king",color:"#1C1610"},
    {x:305,y:120,label:"queen",color:"#C0392B"},
  ];
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g9" />
      <FIG n={9} title="word embedding geometry" />
      <Axis x1={60} y1={275} x2={440} y2={275} />
      <Axis x1={60} y1={275} x2={60} y2={50} />
      {/* Parallelogram arrows */}
      <defs>
        <marker id="arr9" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#8B7355" />
        </marker>
      </defs>
      <line x1="130" y1="210" x2="308" y2="216" stroke="#8B7355" strokeWidth="1" strokeDasharray="4 2" markerEnd="url(#arr9)" />
      <line x1="125" y1="115" x2="303" y2="121" stroke="#8B7355" strokeWidth="1" strokeDasharray="4 2" markerEnd="url(#arr9)" />
      <line x1="130" y1="210" x2="126" y2="120" stroke="#5C4E35" strokeWidth="1" strokeDasharray="4 2" markerEnd="url(#arr9)" />
      <line x1="310" y1="215" x2="306" y2="125" stroke="#5C4E35" strokeWidth="1" strokeDasharray="4 2" markerEnd="url(#arr9)" />
      {/* Gender vector label */}
      <text x="200" y="105" fontFamily="Georgia,serif" fontStyle="italic" fontSize="10" fill="#C0392B" textAnchor="middle">gender →</text>
      {/* Royalty vector label */}
      <text x="85" y="168" fontFamily="Georgia,serif" fontStyle="italic" fontSize="10" fill="#5C4E35">royalty ↑</text>
      {points.map((p,i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="6" fill={p.color} opacity="0.85" />
          <text x={p.x+10} y={p.y-8} fontFamily="Georgia,serif" fontStyle="italic" fontSize="12" fill={p.color}>{p.label}</text>
        </g>
      ))}
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">king − man + woman ≈ queen</text>
    </svg>
  );
}

// ── 10. Positional encoding ───────────────────────────────────────────────────
function Viz10() {
  const dims = [0,2,4,6];
  const colors = ["#1C1610","#C0392B","#5C4E35","#8B7355"];
  const W = 370, ox = 55, oy = 270;
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g10" />
      <FIG n={10} title="positional encoding — sine waves" />
      <Axis x1={ox} y1={oy} x2={ox+W} y2={oy} />
      <Axis x1={ox} y1={oy} x2={ox} y2={45} />
      <text x={ox+W+8} y={oy+4} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35">pos</text>
      <text x={ox-4} y={42} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="end">PE</text>
      {dims.map((d, di) => {
        const freq = 1/(10000**(d/512));
        const pts = Array.from({length:200},(_,i)=>{
          const x = ox + i*(W/200);
          const y = oy - 90*Math.sin(freq*i*8);
          return `${x},${y}`;
        }).join(" ");
        return <polyline key={di} points={pts} stroke={colors[di]} strokeWidth="1.2" fill="none" opacity="0.8" />;
      })}
      {dims.map((d,di) => (
        <g key={di}>
          <line x1={300} y1={62+di*14} x2={318} y2={62+di*14} stroke={colors[di]} strokeWidth="1.2" />
          <text x={322} y={66+di*14} fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={colors[di]}>dim {d}</text>
        </g>
      ))}
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">PE(pos,2i) = sin(pos / 10000^(2i/d))</text>
    </svg>
  );
}

// ── 11. Adam vs SGD trajectories ──────────────────────────────────────────────
function Viz11() {
  const contours = [120,90,62,38,18];
  const cx=240,cy=170;
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g11" />
      <FIG n={11} title="Adam vs SGD — loss landscape" />
      {contours.map((r,i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r*0.55} fill="none" stroke="#1C1610" strokeWidth="0.7" opacity={0.1+i*0.06} />
      ))}
      {/* SGD — zigzag */}
      <polyline points="140,240 160,195 180,220 205,185 225,195 240,170" stroke="#1C1610" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      {/* Adam — smooth */}
      <path d="M345,255 C330,235 310,215 290,200 C270,187 258,178 240,170" stroke="#C0392B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="240" cy="170" r="5" fill="#C0392B" />
      <text x="140" y="254" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#1C1610">SGD</text>
      <text x="345" y="268" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#C0392B">Adam</text>
      <defs>
        <marker id="arr11a" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#1C1610" />
        </marker>
        <marker id="arr11b" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#C0392B" />
        </marker>
        <pattern id="g11" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(180,160,100,0.18)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <Axis x1={80} y1={295} x2={400} y2={295} />
      <Axis x1={80} y1={295} x2={80} y2={45} />
      <text x="410" y="298" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35">w₁</text>
      <text x="72" y="42" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="end">w₂</text>
      <text x="240" y="318" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">Adam adapts per-parameter LR via m̂ₜ and v̂ₜ</text>
    </svg>
  );
}

// ── 12. Gradient clipping histogram ──────────────────────────────────────────
function Viz12() {
  // Histogram bars for gradient norm distribution
  const bars = [
    {x:80,h:20},{x:105,h:45},{x:130,h:90},{x:155,h:150},{x:180,h:195},
    {x:205,h:215},{x:230,h:190},{x:255,h:155},{x:280,h:105},{x:305,h:68},
    {x:330,h:40},{x:355,h:22},{x:380,h:35},{x:405,h:60},{x:430,h:28},
  ];
  const oy = 270, bw = 22;
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g12" />
      <FIG n={12} title="gradient clipping — norm histogram" />
      <Axis x1={65} y1={oy} x2={455} y2={oy} />
      <Axis x1={65} y1={oy} x2={65} y2={45} />
      <text x="50" y="50" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="middle">freq</text>
      <text x="260" y="298" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="middle">‖g‖₂</text>
      {/* Clip threshold */}
      <line x1="360" y1="50" x2="360" y2={oy} stroke="#C0392B" strokeWidth="1.2" strokeDasharray="4 3" />
      <text x="362" y="62" fontFamily="Georgia,serif" fontStyle="italic" fontSize="10" fill="#C0392B">clip=1.0</text>
      {bars.map((b,i) => (
        <rect key={i} x={b.x} y={oy-b.h} width={bw} height={b.h}
          fill={b.x>=360 ? "rgba(192,57,43,0.35)" : "rgba(28,22,16,0.18)"}
          stroke={b.x>=360 ? "#C0392B" : "#8B7355"} strokeWidth="0.6" />
      ))}
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">clip: g ← g · min(1, τ/‖g‖) stabilises training</text>
    </svg>
  );
}

// ── 13. Chinchilla scaling ────────────────────────────────────────────────────
function Viz13() {
  const W = 350, ox=65, oy=270;
  // Log-scale: models plotted as circles
  const models = [
    {x:120,y:220,r:8,label:"GPT-2",sub:"1.5B"},
    {x:200,y:175,r:12,label:"GPT-3",sub:"175B"},
    {x:270,y:135,r:16,label:"PaLM",sub:"540B"},
    {x:310,y:115,r:14,label:"Chinchilla",sub:"70B*",rust:true},
    {x:360,y:95,r:20,label:"GPT-4",sub:"~1T?"},
  ];
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g13" />
      <FIG n={13} title="Chinchilla scaling laws" />
      <Axis x1={ox} y1={oy} x2={ox+W} y2={oy} />
      <Axis x1={ox} y1={oy} x2={ox} y2={45} />
      <text x={ox-4} y={42} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="end">loss</text>
      <text x={ox+W+8} y={oy+4} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35">compute</text>
      {/* Pareto frontier */}
      <path d="M100,240 C160,200 230,160 300,130 C340,115 380,105 410,98" stroke="#8B7355" strokeWidth="1" strokeDasharray="4 2" fill="none" />
      {models.map((m,i) => (
        <g key={i}>
          <circle cx={m.x} cy={m.y} r={m.r} fill={m.rust?"rgba(192,57,43,0.2)":"rgba(28,22,16,0.1)"} stroke={m.rust?"#C0392B":"#8B7355"} strokeWidth="1.2" />
          <text x={m.x} y={m.y-m.r-4} fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={m.rust?"#C0392B":"#1C1610"} textAnchor="middle">{m.label}</text>
        </g>
      ))}
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">N* = 0.22C^0.50, D* = 0.19C^0.50 (tokens ≈ params)</text>
    </svg>
  );
}

// ── 14. Quantization FP32 vs INT8 ─────────────────────────────────────────────
function Viz14() {
  const oy = 185;
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g14" />
      <FIG n={14} title="quantization — FP32 vs INT8" />
      {/* FP32 continuous */}
      <text x="65" y="65" fontFamily="'JetBrains Mono',monospace" fontSize="10" fill="#1C1610">FP32</text>
      <line x1="80" y1="90" x2="400" y2="90" stroke="#1C1610" strokeWidth="2" />
      {Array.from({length:16},(_,i)=>(
        <g key={i}>
          <circle cx={80+i*20} cy={90} r="2.5" fill="#1C1610" opacity="0.5+i*0.03" />
        </g>
      ))}
      <text x="240" y="112" fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#5C4E35" textAnchor="middle">dense representation · 32 bits</text>
      {/* INT8 quantized */}
      <text x="65" y="158" fontFamily="'JetBrains Mono',monospace" fontSize="10" fill="#C0392B">INT8</text>
      <line x1="80" y1="185" x2="400" y2="185" stroke="#C0392B" strokeWidth="1.5" />
      {[-3,-2,-1,0,1,2,3].map((v,i)=>{
        const x = 80+i*52;
        return (
          <g key={i}>
            <line x1={x} y1="178" x2={x} y2="192" stroke="#C0392B" strokeWidth="1.2" />
            <text x={x} y="204" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#C0392B" textAnchor="middle">{v}</text>
          </g>
        );
      })}
      <text x="240" y="220" fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#5C4E35" textAnchor="middle">8 discrete levels · 8 bits per weight</text>
      {/* Savings table */}
      <rect x="120" y="240" width="240" height="65" fill="#F7F2E7" stroke="#C8B882" strokeWidth="1" />
      {[["","FP32","INT8"],["size","4×","1×"],["throughput","1×","3–4×"],["accuracy","baseline","≈ −0.5%"]].map((row,i)=>(
        row.map((cell,j) => (
          <text key={`${i}-${j}`} x={130+j*75} y={254+i*14} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill={j===2?"#C0392B":"#1C1610"}>{cell}</text>
        ))
      ))}
      <text x="240" y="320" fontFamily="Georgia,serif" fontStyle="italic" fontSize="10" fill="#1C1610" textAnchor="middle">LLM.int8() — blocks of 16 with outlier FP16 fallback</text>
    </svg>
  );
}

// ── 15. KV cache growth ───────────────────────────────────────────────────────
function Viz15() {
  const W=360, ox=65, oy=270;
  const bars32 = [20,40,60,85,115,150,190,240,300].map((h,i)=>({h,i}));
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g15" />
      <FIG n={15} title="KV cache — memory growth" />
      <Axis x1={ox} y1={oy} x2={ox+W} y2={oy} />
      <Axis x1={ox} y1={oy} x2={ox} y2={45} />
      <text x={ox-4} y={42} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="end">MB</text>
      <text x={ox+W+8} y={oy+4} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35">tokens</text>
      {[0,500,1000,2000,4000].map((v,i)=>{
        const x=ox+i*88;
        return <g key={i}>
          <line x1={x} y1={oy} x2={x} y2={oy+5} stroke="#1C1610" strokeWidth="0.7" />
          <text x={x} y={oy+14} fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#8B7355" textAnchor="middle">{v}</text>
        </g>;
      })}
      {bars32.map(({h,i})=>{
        const x=ox+i*38+8;
        return <rect key={i} x={x} y={oy-h} width={28} height={h} fill="rgba(28,22,16,0.15)" stroke="#8B7355" strokeWidth="0.7" />;
      })}
      {/* Quadratic line */}
      <path d="M73,268 C120,250 175,225 240,190 C295,160 340,120 400,65" stroke="#C0392B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <text x="385" y="58" fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#C0392B">O(n²)</text>
      {/* Annotation */}
      <text x="200" y="315" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">2 × layers × heads × dₖ × seq_len × 2 bytes</text>
    </svg>
  );
}

// ── 16. MoE routing ───────────────────────────────────────────────────────────
function Viz16() {
  const experts = [
    {x:290,y:75,label:"expert 1",w:"0.52"},
    {x:360,y:140,label:"expert 2",w:"0.31"},
    {x:340,y:230,label:"expert 3",w:"0.11"},
    {x:260,y:290,label:"expert 4",w:"0.04"},
    {x:180,y:290,label:"expert 5",w:"0.02"},
  ];
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g16" />
      <FIG n={16} title="mixture-of-experts routing" />
      {/* Token input */}
      <rect x="70" y="145" width="80" height="32" fill="#F7F2E7" stroke="#C8B882" strokeWidth="1" />
      <text x="110" y="165" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#1C1610" textAnchor="middle">token x</text>
      {/* Router */}
      <rect x="175" y="150" width="70" height="22" fill="rgba(192,57,43,0.08)" stroke="#C0392B" strokeWidth="1.2" />
      <text x="210" y="165" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#C0392B" textAnchor="middle">router</text>
      {/* Arrows to experts */}
      {experts.map((e,i) => {
        const opacity = parseFloat(e.w);
        return (
          <g key={i}>
            <line x1="245" y1="161" x2={e.x-30} y2={e.y+15} stroke="#5C4E35" strokeWidth={opacity*6+0.5} opacity={0.3+opacity*1.2} />
            <rect x={e.x-30} y={e.y} width="90" height="28" fill="#F7F2E7" stroke={i<2?"#C0392B":"#C8B882"} strokeWidth={i<2?1.2:0.8} />
            <text x={e.x+15} y={e.y+17} fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={i<2?"#C0392B":"#8B7355"} textAnchor="middle">{e.label}</text>
            <text x={e.x+15} y={e.y+28} fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#8B7355" textAnchor="middle">p={e.w}</text>
          </g>
        );
      })}
      <line x1="150" y1="161" x2="175" y2="161" stroke="#1C1610" strokeWidth="1" markerEnd="url(#arr16)" />
      <defs>
        <marker id="arr16" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#1C1610" />
        </marker>
      </defs>
      <text x="240" y="330" fontFamily="Georgia,serif" fontStyle="italic" fontSize="10" fill="#1C1610" textAnchor="middle">top-2 routing — only k experts activated per token</text>
    </svg>
  );
}

// ── 17. RLHF pipeline ─────────────────────────────────────────────────────────
function Viz17() {
  const stages = [
    {x:40,y:130,label:"Pretrain\nSFT base",sub:"cross-entropy"},
    {x:155,y:130,label:"Reward\nModel",sub:"Bradley-Terry"},
    {x:270,y:130,label:"RL via\nPPO",sub:"KL penalty"},
    {x:380,y:130,label:"RLHF\nModel",sub:"aligned"},
  ];
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g17" />
      <FIG n={17} title="RLHF pipeline" />
      <defs>
        <marker id="arr17" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#5C4E35" />
        </marker>
        <pattern id="g17" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(180,160,100,0.18)" strokeWidth="0.5" />
        </pattern>
      </defs>
      {stages.map((s,i) => {
        const lines = s.label.split("\n");
        const isLast = i===stages.length-1;
        return (
          <g key={i}>
            <rect x={s.x} y={s.y} width="95" height="55" fill={isLast?"rgba(192,57,43,0.08)":"#F7F2E7"} stroke={isLast?"#C0392B":"#C8B882"} strokeWidth={isLast?1.5:1} />
            {lines.map((line,li) => (
              <text key={li} x={s.x+47} y={s.y+20+li*14} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill={isLast?"#C0392B":"#1C1610"} textAnchor="middle">{line}</text>
            ))}
            <text x={s.x+47} y={s.y+50} fontFamily="Georgia,serif" fontStyle="italic" fontSize="8" fill="#8B7355" textAnchor="middle">{s.sub}</text>
            {i<stages.length-1 && <line x1={s.x+95} y1={s.y+27} x2={s.x+108} y2={s.y+27} stroke="#5C4E35" strokeWidth="1" markerEnd="url(#arr17)" />}
          </g>
        );
      })}
      {/* Human feedback loop */}
      <path d="M202,185 C202,220 327,220 327,185" stroke="#C0392B" strokeWidth="1.2" fill="none" strokeDasharray="4 3" markerEnd="url(#arr17)" />
      <text x="265" y="235" fontFamily="Georgia,serif" fontStyle="italic" fontSize="10" fill="#C0392B" textAnchor="middle">human preference labels</text>
      {/* Annotation */}
      <text x="240" y="275" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#5C4E35" textAnchor="middle">objective: r(x,y) − β · KL[π_θ ‖ π_ref]</text>
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">align LM output to human preferences</text>
    </svg>
  );
}

// ── 18. Reward hacking dual-axis ──────────────────────────────────────────────
function Viz18() {
  const ox=65,oy=250,W=370;
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g18" />
      <FIG n={18} title="reward hacking — Goodhart's law" />
      <Axis x1={ox} y1={oy} x2={ox+W} y2={oy} />
      <Axis x1={ox} y1={oy} x2={ox} y2={45} />
      {/* Second y-axis */}
      <line x1={ox+W} y1={oy} x2={ox+W} y2={45} stroke="#C0392B" strokeWidth="0.8" />
      <text x={ox+W+12} y={48} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#C0392B">proxy</text>
      <text x={ox-4} y={42} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#1C1610" textAnchor="end">true</text>
      <text x={ox+W/2} y={oy+18} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="middle">RL training steps →</text>
      {/* True reward — rises then plateaus/falls */}
      <path d="M65,240 C120,200 180,160 230,140 C265,128 290,130 320,138 C350,148 385,168 435,195" stroke="#1C1610" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Proxy reward — keeps rising */}
      <path d="M65,242 C120,205 180,168 235,140 C280,118 330,98 380,75 C405,65 425,58 435,54" stroke="#C0392B" strokeWidth="1.4" strokeDasharray="5 3" fill="none" strokeLinecap="round" />
      {/* Divergence marker */}
      <line x1="290" y1="45" x2="290" y2={oy} stroke="#8B7355" strokeWidth="0.8" strokeDasharray="3 2" />
      <text x="293" y="58" fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#8B7355">divergence</text>
      <line x1="270" y1="62" x2="285" y2="72" stroke="#1C1610" strokeWidth="1.2" />
      <text x="200" y="68" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#1C1610">true reward</text>
      <text x="385" y="46" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#C0392B">proxy</text>
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">when a measure becomes a target, it ceases to be good</text>
    </svg>
  );
}

// ── 19. Batch size effect ─────────────────────────────────────────────────────
function Viz19() {
  const ox=65,oy=270,W=370;
  // Larger batch → sharper minima → worse generalisation (Keskar et al.)
  const smallBatch = "M75,180 C110,160 150,145 195,140 C235,137 280,138 330,142 C375,146 415,153 435,158";
  const largeBatch = "M75,200 C110,175 150,155 195,145 C235,138 280,132 330,128 C375,125 415,122 435,120";
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g19" />
      <FIG n={19} title="batch size — sharpness of minima" />
      <Axis x1={ox} y1={oy} x2={ox+W} y2={oy} />
      <Axis x1={ox} y1={oy} x2={ox} y2={45} />
      <text x={ox-4} y={42} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="end">loss</text>
      <text x={ox+W+8} y={oy+4} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35">epoch</text>
      {/* Loss curves */}
      <path d={smallBatch} stroke="#1C1610" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d={largeBatch} stroke="#C0392B" strokeWidth="1.4" strokeDasharray="5 3" fill="none" strokeLinecap="round" />
      {/* Minima width illustration */}
      <path d="M155,220 C180,210 215,205 255,205 C295,205 320,210 340,218" stroke="#8B7355" strokeWidth="1" fill="rgba(180,160,100,0.08)" />
      <text x="247" y="232" fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#8B7355" textAnchor="middle">flat minimum</text>
      <path d="M270,160 C280,152 292,148 305,148 C318,148 325,152 330,157" stroke="#C0392B" strokeWidth="1" fill="rgba(192,57,43,0.08)" />
      <text x="300" y="142" fontFamily="Georgia,serif" fontStyle="italic" fontSize="9" fill="#C0392B" textAnchor="middle">sharp</text>
      <line x1="290" y1="62" x2="310" y2="62" stroke="#1C1610" strokeWidth="1.8" />
      <text x="314" y="65" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#1C1610">small B</text>
      <line x1="290" y1="78" x2="310" y2="78" stroke="#C0392B" strokeWidth="1.4" strokeDasharray="5 3" />
      <text x="314" y="81" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#C0392B">large B</text>
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">small batches → flat minima → better generalisation</text>
    </svg>
  );
}

// ── 20. Weight init signal propagation ───────────────────────────────────────
function Viz20() {
  const ox=65,oy=265,W=370;
  const layers = [1,2,3,4,5,6,7,8,10,12,14,16,20,24,28,32];
  // var(x) evolution: bad init explodes or vanishes; Xavier stays flat
  const xavier = layers.map(l=>({x:ox+l*(W/32),y:oy-95}));
  const tooLarge = layers.map((l,i)=>({x:ox+l*(W/32),y:oy-Math.min(210,95+i*i*1.2)}));
  const tooSmall = layers.map((l,i)=>({x:ox+l*(W/32),y:Math.max(oy-95+i*i*0.8,oy-95)}));
  const xavierPts = xavier.map(p=>`${p.x},${p.y}`).join(" ");
  const largePts = tooLarge.map(p=>`${p.x},${p.y}`).join(" ");
  const smallPts = tooSmall.map(p=>`${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox="0 0 480 340" aria-hidden className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <BG id="g20" />
      <FIG n={20} title="weight init — signal variance across layers" />
      <Axis x1={ox} y1={oy} x2={ox+W} y2={oy} />
      <Axis x1={ox} y1={oy} x2={ox} y2={45} />
      <text x={ox-4} y={42} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35" textAnchor="end">Var(x)</text>
      <text x={ox+W+8} y={oy+4} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5C4E35">layer</text>
      {[0,8,16,24,32].map((v,i)=>(
        <g key={i}>
          <line x1={ox+v*(W/32)} y1={oy} x2={ox+v*(W/32)} y2={oy+5} stroke="#1C1610" strokeWidth="0.7" />
          <text x={ox+v*(W/32)} y={oy+15} fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#8B7355" textAnchor="middle">{v}</text>
        </g>
      ))}
      <polyline points={xavierPts} stroke="#1C1610" strokeWidth="1.8" fill="none" />
      <polyline points={largePts} stroke="#C0392B" strokeWidth="1.4" strokeDasharray="5 3" fill="none" />
      <polyline points={smallPts} stroke="#8B7355" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
      <line x1="300" y1="62" x2="320" y2="62" stroke="#1C1610" strokeWidth="1.8" />
      <text x="324" y="65" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#1C1610">Xavier/He</text>
      <line x1="300" y1="77" x2="320" y2="77" stroke="#C0392B" strokeWidth="1.4" strokeDasharray="5 3" />
      <text x="324" y="80" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#C0392B">σ too large</text>
      <line x1="300" y1="92" x2="320" y2="92" stroke="#8B7355" strokeWidth="1.2" strokeDasharray="3 2" />
      <text x="324" y="95" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#8B7355">σ too small</text>
      <text x="240" y="316" fontFamily="Georgia,serif" fontStyle="italic" fontSize="11" fill="#1C1610" textAnchor="middle">Xavier: Var(W) = 2/(n_in + n_out) keeps signal stable</text>
    </svg>
  );
}

const VIZZES = [
  Viz1, Viz2, Viz3, Viz4, Viz5, Viz6, Viz7, Viz8, Viz9, Viz10,
  Viz11, Viz12, Viz13, Viz14, Viz15, Viz16, Viz17, Viz18, Viz19, Viz20,
];

export function MLVizRandomizer() {
  const [idx, setIdx] = useState<number | null>(null);

  useEffect(() => {
    setIdx(Math.floor(Math.random() * VIZZES.length));
  }, []);

  if (idx === null) return <div className="w-full h-full bg-[#FFFDF5]" />;

  const Viz = VIZZES[idx];
  return <Viz />;
}
