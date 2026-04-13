"use client";

import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import { ProgressState, ProgressAction, ChapterId } from "@/types/curriculum";

const STORAGE_KEY = "embriAIO_progress_v1";

function createEmptyChapterProgress(chapterId: ChapterId) {
  return { chapterId, notebookProgress: {}, videoWatched: false };
}

function createDefaultState(): ProgressState {
  return { chapters: {} as ProgressState["chapters"], lastUpdatedAt: new Date().toISOString() };
}

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  const now = new Date().toISOString();

  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "MARK_NOTEBOOK_COMPLETE": {
      const prev = state.chapters[action.chapterId] ?? createEmptyChapterProgress(action.chapterId);
      return {
        ...state,
        lastUpdatedAt: now,
        chapters: {
          ...state.chapters,
          [action.chapterId]: {
            ...prev,
            notebookProgress: {
              ...prev.notebookProgress,
              [action.notebookSlug]: {
                notebookSlug: action.notebookSlug,
                status: "completed",
                completedAt: now,
                lastOpenedAt: now,
              },
            },
          },
        },
      };
    }

    case "MARK_NOTEBOOK_IN_PROGRESS": {
      const prev = state.chapters[action.chapterId] ?? createEmptyChapterProgress(action.chapterId);
      const existing = prev.notebookProgress[action.notebookSlug];
      if (existing?.status === "completed") return state;
      return {
        ...state,
        lastUpdatedAt: now,
        chapters: {
          ...state.chapters,
          [action.chapterId]: {
            ...prev,
            notebookProgress: {
              ...prev.notebookProgress,
              [action.notebookSlug]: {
                notebookSlug: action.notebookSlug,
                status: "in_progress",
                lastOpenedAt: now,
                completedAt: existing?.completedAt,
              },
            },
          },
        },
      };
    }

    case "RESET_NOTEBOOK": {
      const prev = state.chapters[action.chapterId] ?? createEmptyChapterProgress(action.chapterId);
      const { [action.notebookSlug]: _, ...rest } = prev.notebookProgress;
      return {
        ...state,
        lastUpdatedAt: now,
        chapters: {
          ...state.chapters,
          [action.chapterId]: { ...prev, notebookProgress: rest },
        },
      };
    }

    case "MARK_VIDEO_WATCHED": {
      const prev = state.chapters[action.chapterId] ?? createEmptyChapterProgress(action.chapterId);
      return {
        ...state,
        lastUpdatedAt: now,
        chapters: {
          ...state.chapters,
          [action.chapterId]: { ...prev, videoWatched: true },
        },
      };
    }

    case "RESET_ALL":
      return createDefaultState();

    default:
      return state;
  }
}

interface ProgressContextValue {
  state: ProgressState;
  dispatch: React.Dispatch<ProgressAction>;
  isHydrated: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, createDefaultState());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ProgressState;
        dispatch({ type: "HYDRATE", state: parsed });
      }
    } catch {
      // corrupted storage — start fresh
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable
    }
  }, [state, isHydrated]);

  return (
    <ProgressContext.Provider value={{ state, dispatch, isHydrated }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgressContext must be used within ProgressProvider");
  return ctx;
}
