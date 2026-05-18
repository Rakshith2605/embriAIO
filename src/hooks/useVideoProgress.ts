"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useProgressContext } from "@/context/ProgressContext";
import { ChapterId, VideoProgress } from "@/types/curriculum";

const LS_PREFIX = "emrAIO_video_v1_";

function lsKey(videoId: string) {
  return `${LS_PREFIX}${videoId}`;
}

function readLocalStorage(videoId: string): VideoProgress | null {
  try {
    const raw = localStorage.getItem(lsKey(videoId));
    if (!raw) return null;
    return JSON.parse(raw) as VideoProgress;
  } catch {
    return null;
  }
}

function writeLocalStorage(videoId: string, vp: VideoProgress) {
  try {
    localStorage.setItem(lsKey(videoId), JSON.stringify(vp));
  } catch {
    // storage full
  }
}

function removeLocalStorage(videoId: string) {
  try {
    localStorage.removeItem(lsKey(videoId));
  } catch {
    // ignore
  }
}

export function useVideoProgress(chapterId: ChapterId, videoId: string) {
  const { state, dispatch, isHydrated } = useProgressContext();
  const { data: session } = useSession();
  const didSyncLocalRef = useRef(false);
  const lastEmailRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastEmailRef.current !== (session?.user?.email ?? null)) {
      didSyncLocalRef.current = false;
      lastEmailRef.current = session?.user?.email ?? null;
    }
  }, [session?.user?.email]);

  const progress = state.chapters[chapterId]?.videoProgress[videoId] ?? null;

  const getSavedPosition = useCallback((): VideoProgress | null => {
    if (progress?.percentWatched) return progress;
    if (!session?.user?.email) {
      return readLocalStorage(videoId);
    }
    return null;
  }, [progress, session?.user?.email, videoId]);

  const savePosition = useCallback(
    (currentTime: number, duration: number, percentWatched: number) => {
      dispatch({
        type: "UPDATE_VIDEO_PROGRESS",
        chapterId,
        videoId,
        currentTime,
        duration,
        percentWatched,
      });
      if (!session?.user?.email) {
        writeLocalStorage(videoId, {
          videoId,
          currentTime,
          duration,
          percentWatched,
          lastWatchedAt: new Date().toISOString(),
        });
      }
    },
    [dispatch, chapterId, videoId, session?.user?.email]
  );

  const syncLocalToStore = useCallback((): VideoProgress | null => {
    if (!session?.user?.email || !isHydrated || didSyncLocalRef.current) return null;
    const local = readLocalStorage(videoId);
    if (local && local.percentWatched > 0) {
      const existing = state.chapters[chapterId]?.videoProgress[videoId];
      if (!existing || local.percentWatched > existing.percentWatched) {
        dispatch({
          type: "UPDATE_VIDEO_PROGRESS",
          chapterId,
          videoId,
          currentTime: local.currentTime,
          duration: local.duration,
          percentWatched: local.percentWatched,
        });
      }
      removeLocalStorage(videoId);
    }
    didSyncLocalRef.current = true;
    return local;
  }, [session?.user?.email, isHydrated, videoId, chapterId, state.chapters, dispatch]);

  return {
    savedProgress: progress,
    getSavedPosition,
    savePosition,
    syncLocalToStore,
    isCompleted: (progress?.percentWatched ?? 0) >= 90,
  };
}
