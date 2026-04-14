"use client";

import { useState } from "react";
import { ProgressProvider } from "@/context/ProgressContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ProgressProvider>
      <div style={{
        background: '#F7F2E7',
        backgroundImage: 'linear-gradient(rgba(180,160,100,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(180,160,100,0.12) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        minHeight: '100vh',
      }}>
        <AppSidebar />
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        <div className="lg:pl-64">
          <TopBar
            onMobileMenuToggle={() => setMobileMenuOpen((o) => !o)}
            mobileMenuOpen={mobileMenuOpen}
          />
          <main className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ProgressProvider>
  );
}
