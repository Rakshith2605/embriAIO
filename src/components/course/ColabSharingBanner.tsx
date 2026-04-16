"use client";

import { COLAB_SHARING_INSTRUCTIONS } from "@/lib/colab-utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function ColabSharingBanner() {
  return (
    <div
      style={{ background: "#FFF8E7", border: "1px solid #E6D9A8" }}
      className="p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#B8860B" }} />
        <div>
          <p
            className="font-playfair font-bold text-[15px] mb-2"
            style={{ color: "#1C1610" }}
          >
            {COLAB_SHARING_INSTRUCTIONS.title}
          </p>
          <ol className="space-y-1.5 mb-3">
            {COLAB_SHARING_INSTRUCTIONS.steps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-2 font-source-serif text-[13px]"
                style={{ color: "#5C4E35" }}
              >
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0 mt-0.5"
                  style={{ color: "#B8860B" }}
                />
                {step}
              </li>
            ))}
          </ol>
          <p
            className="font-source-serif text-[12px] italic"
            style={{ color: "#8B7355" }}
          >
            {COLAB_SHARING_INSTRUCTIONS.warning}
          </p>
        </div>
      </div>
    </div>
  );
}
