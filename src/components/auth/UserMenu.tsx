"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { LogIn, LogOut, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (status === "loading") {
    return (
      <div
        className="h-7 w-14 animate-pulse"
        style={{ background: "rgba(200,184,130,0.25)" }}
      />
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 font-jetbrains text-[10px] tracking-[0.08em] uppercase transition-colors"
        style={{ border: "1px solid #C8B882", color: "#5C4E35" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#C0392B";
          (e.currentTarget as HTMLElement).style.color = "#C0392B";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#C8B882";
          (e.currentTarget as HTMLElement).style.color = "#5C4E35";
        }}
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign In
      </button>
    );
  }

  const name = session.user?.name ?? "User";
  const email = session.user?.email ?? "";
  const image = session.user?.image;
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 transition-colors"
        style={{ color: "#5C4E35" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "#C0392B";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "#5C4E35";
        }}
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            width={24}
            height={24}
            className="rounded-full shrink-0"
            style={{ border: "1px solid #C8B882" }}
          />
        ) : (
          <div
            className="h-6 w-6 shrink-0 flex items-center justify-center font-jetbrains text-[9px] font-bold rounded-full"
            style={{ background: "#C0392B", color: "#F7F2E7" }}
          >
            {initials}
          </div>
        )}
        <span
          className="hidden sm:block font-jetbrains text-[10px] max-w-[90px] truncate"
          style={{ color: "#5C4E35" }}
        >
          {name.split(" ")[0]}
        </span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "#A08E6B" }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-52 z-50"
          style={{
            background: "#FFFDF5",
            border: "1px solid #C8B882",
            boxShadow: "0 4px 16px rgba(28,22,16,0.1)",
          }}
        >
          {/* User info */}
          <div
            className="px-3 py-2.5"
            style={{ borderBottom: "1px solid #C8B882" }}
          >
            <p
              className="font-playfair text-[13px] truncate"
              style={{ color: "#1C1610" }}
            >
              {name}
            </p>
            <p
              className="font-jetbrains text-[9px] truncate mt-0.5"
              style={{ color: "#A08E6B" }}
            >
              {email}
            </p>
            <p
              className="font-jetbrains text-[8px] mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5"
              style={{ border: "1px solid #C8B882", color: "#8B7355", background: "#EDE8D5" }}
            >
              ● Progress synced
            </p>
          </div>

          {/* Sign out */}
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 font-jetbrains text-[10px] uppercase tracking-[0.08em] text-left transition-colors"
            style={{ color: "#5C4E35" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(192,57,43,0.06)";
              (e.currentTarget as HTMLElement).style.color = "#C0392B";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#5C4E35";
            }}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
