"use client";

import React, { createContext, useContext } from "react";
import type { Curriculum } from "@/types/curriculum";

const CurriculumContext = createContext<Curriculum | null>(null);

export function CurriculumProvider({
  curriculum,
  children,
}: {
  curriculum: Curriculum;
  children: React.ReactNode;
}) {
  return (
    <CurriculumContext.Provider value={curriculum}>
      {children}
    </CurriculumContext.Provider>
  );
}

export function useCurriculum(): Curriculum {
  const ctx = useContext(CurriculumContext);
  if (!ctx) throw new Error("useCurriculum must be used within CurriculumProvider");
  return ctx;
}
