"use client";

import { AccentColor } from "@/types/user-course";
import { cn } from "@/lib/utils";

const COLORS: { value: AccentColor; bg: string; ring: string }[] = [
  { value: "violet",  bg: "bg-violet-500",  ring: "ring-violet-400" },
  { value: "blue",    bg: "bg-blue-500",    ring: "ring-blue-400" },
  { value: "orange",  bg: "bg-orange-500",  ring: "ring-orange-400" },
  { value: "emerald", bg: "bg-emerald-500", ring: "ring-emerald-400" },
  { value: "cyan",    bg: "bg-cyan-500",    ring: "ring-cyan-400" },
  { value: "pink",    bg: "bg-pink-500",    ring: "ring-pink-400" },
  { value: "yellow",  bg: "bg-yellow-500",  ring: "ring-yellow-400" },
  { value: "red",     bg: "bg-red-500",     ring: "ring-red-400" },
  { value: "indigo",  bg: "bg-indigo-500",  ring: "ring-indigo-400" },
  { value: "teal",    bg: "bg-teal-500",    ring: "ring-teal-400" },
];

interface Props {
  value: AccentColor;
  onChange: (color: AccentColor) => void;
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className={cn(
            "w-8 h-8 rounded-full transition-all",
            c.bg,
            value === c.value && `ring-2 ring-offset-2 ring-offset-[#F7F2E7] ${c.ring} scale-110`
          )}
          aria-label={c.value}
        />
      ))}
    </div>
  );
}
