"use client";

import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ProgressState, ProgressAction, ChapterId } from "@/types/curriculum";

const STORAGE_KEY = "emrAIO_progress_v1";
const SYNC_DEBOUNCE_MS = 2000;

// ─── Reducer ──────────────────────────────────────────────────────────────────

function createEmptyChapterProgress(chapterId: ChapterId) {
  return { chapterId, notebookProgress: {}, videoProgress: {}, videoWatched: false };
}

function createDefaultState(): ProgressState {
  return { chapters: {} as ProgressState["chapters"], lastUpdatedAt: new Date().toISOString() };
}

function normalizeState(state: ProgressState): ProgressState {
  let changed = false;
  const chapters = { ...state.chapters };
  for (const cid of Object.keys(chapters)) {
    const ch = chapters[cid as ChapterId];
    if (!ch.videoProgress) {
      chapters[cid as ChapterId] = { ...ch, videoProgress: {} };
      changed = true;
    }
  }
  return changed ? { ...state, chapters } : state;
}

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  const now = new Date().toISOString();

  switch (action.type) {
    case "HYDRATE":
      return normalizeState(action.state);

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
      const vp = { ...prev.videoProgress };
      if (action.videoId) {
        vp[action.videoId] = {
          videoId: action.videoId,
          currentTime: 0,
          duration: 0,
          percentWatched: 100,
          lastWatchedAt: now,
        };
      }
      return {
        ...state,
        lastUpdatedAt: now,
        chapters: {
          ...state.chapters,
          [action.chapterId]: { ...prev, videoProgress: vp, videoWatched: true },
        },
      };
    }

    case "UPDATE_VIDEO_PROGRESS": {
      const prev = state.chapters[action.chapterId] ?? createEmptyChapterProgress(action.chapterId);
      const vp = {
        ...prev.videoProgress,
        [action.videoId]: {
          videoId: action.videoId,
          currentTime: action.currentTime,
          duration: action.duration,
          percentWatched: action.percentWatched,
          lastWatchedAt: now,
        },
      };
      const allVideosWatched = Object.keys(vp).length > 0 && Object.values(vp).every((v) => v.percentWatched >= 90);
      return {
        ...state,
        lastUpdatedAt: now,
        chapters: {
          ...state.chapters,
          [action.chapterId]: { ...prev, videoProgress: vp, videoWatched: prev.videoWatched || allVideosWatched },
        },
      };
    }

    case "MARK_VIDEO_COMPLETED": {
      const prev = state.chapters[action.chapterId] ?? createEmptyChapterProgress(action.chapterId);
      const vp = {
        ...prev.videoProgress,
        [action.videoId]: {
          videoId: action.videoId,
          currentTime: (prev.videoProgress[action.videoId]?.duration ?? 0),
          duration: (prev.videoProgress[action.videoId]?.duration ?? 0),
          percentWatched: 100,
          lastWatchedAt: now,
        },
      };
      const allVideosWatched = Object.values(vp).every((v) => v.percentWatched >= 90);
      return {
        ...state,
        lastUpdatedAt: now,
        chapters: {
          ...state.chapters,
          [action.chapterId]: { ...prev, videoProgress: vp, videoWatched: prev.videoWatched || allVideosWatched },
        },
      };
    }

    case "RESET_VIDEO_PROGRESS": {
      const prev = state.chapters[action.chapterId];
      if (!prev) return state;
      const { [action.videoId]: _, ...rest } = prev.videoProgress;
      const allVideosWatched = Object.keys(rest).length > 0 && Object.values(rest).every((v) => v.percentWatched >= 90);
      return {
        ...state,
        lastUpdatedAt: now,
        chapters: {
          ...state.chapters,
          [action.chapterId]: { ...prev, videoProgress: rest, videoWatched: allVideosWatched },
        },
      };
    }

    case "RESET_ALL":
      return createDefaultState();

    default:
      return state;
  }
}

// ─── Redis merge ──────────────────────────────────────────────────────────────

function mergeProgressStates(local: ProgressState, remote: ProgressState): ProgressState {
  const normalizedRemote = normalizeState(remote);
  const merged: ProgressState = {
    ...local,
    lastUpdatedAt: new Date().toISOString(),
    chapters: { ...local.chapters },
  };

  for (const [chapterId, remoteChapter] of Object.entries(normalizedRemote.chapters)) {
    const cid = chapterId as ChapterId;
    const localChapter = merged.chapters[cid];

    if (!localChapter) {
      merged.chapters[cid] = remoteChapter;
      continue;
    }

    const mergedNotebooks = { ...localChapter.notebookProgress };
    for (const [slug, remoteNb] of Object.entries(remoteChapter.notebookProgress)) {
      const localNb = mergedNotebooks[slug];
      if (!localNb || remoteNb.status === "completed") {
        mergedNotebooks[slug] = remoteNb;
      }
    }

    const mergedVideos = { ...localChapter.videoProgress };
    for (const [vidId, remoteVid] of Object.entries(remoteChapter.videoProgress)) {
      const localVid = mergedVideos[vidId];
      if (!localVid || remoteVid.percentWatched > localVid.percentWatched) {
        mergedVideos[vidId] = remoteVid;
      }
    }

    const allVideosWatched = Object.keys(mergedVideos).length > 0 && Object.values(mergedVideos).every((v) => v.percentWatched >= 90);

    merged.chapters[cid] = {
      ...localChapter,
      notebookProgress: mergedNotebooks,
      videoProgress: mergedVideos,
      videoWatched: localChapter.videoWatched || remoteChapter.videoWatched || allVideosWatched,
    };
  }

  return merged;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ProgressContextValue {
  state: ProgressState;
  dispatch: React.Dispatch<ProgressAction>;
  isHydrated: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, createDefaultState());
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: session } = useSession();
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didFetchRemote = useRef(false);

  // 1. Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ProgressState;
        dispatch({ type: "HYDRATE", state: normalizeState(parsed) });
      }
    } catch {
      // corrupted storage — start fresh
    }
    setIsHydrated(true);
  }, []);

  // 2. Once hydrated + signed in: fetch Redis and merge (once per session)
  useEffect(() => {
    if (!isHydrated || !session?.user?.email || didFetchRemote.current) return;
    didFetchRemote.current = true;

    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((remote: ProgressState | null) => {
        if (!remote || Object.keys(remote.chapters ?? {}).length === 0) return;
        dispatch({ type: "HYDRATE", state: mergeProgressStates(state, remote) });
      })
      .catch(() => {}); // fail silently — local data is the fallback
  }, [isHydrated, session?.user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Persist to localStorage on every change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable
    }
  }, [state, isHydrated]);

  // 4. Debounced sync to Redis when signed in
  useEffect(() => {
    if (!isHydrated || !session?.user?.email) return;

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      }).catch(() => {}); // fail silently
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [state, isHydrated, session?.user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

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
