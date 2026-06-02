"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PlayCircle } from "lucide-react";
import { ChapterId, VideoProgress } from "@/types/curriculum";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { VideoProgressBar } from "./VideoProgressBar";
import { ResumeToast } from "./ResumeToast";

interface Props {
  videoId: string;
  title: string;
  chapterId: ChapterId;
  courseId?: string;
  dbVideoId?: string;
  onComplete?: () => void;
  compact?: boolean;
  className?: string;
}

const SAVE_INTERVAL_MS = 5000;
let apiScriptLoading = false;
let apiReadyPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (apiReadyPromise) return apiReadyPromise;
  if (typeof window !== "undefined" && window.YT?.Player) {
    apiReadyPromise = Promise.resolve();
    return apiReadyPromise;
  }

  apiReadyPromise = new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
  });

  if (!apiScriptLoading) {
    apiScriptLoading = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
  }

  return apiReadyPromise;
}

export function YouTubePlayer({
  videoId,
  title,
  chapterId,
  courseId,
  dbVideoId,
  onComplete,
  compact = false,
  className,
}: Props) {
  const [clicked, setClicked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedFiredRef = useRef(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const resumeDataRef = useRef<{ currentTime: number; percentWatched: number } | null>(null);
  const lastProgressEventRef = useRef(0);

  const {
    savePosition,
    getSavedPosition,
    syncLocalToStore,
    savedProgress,
    isCompleted,
  } = useVideoProgress(chapterId, videoId);

  const percentWatched = savedProgress?.percentWatched ?? 0;

  const syncProgressToCourse = useCallback(
    (currentPercent: number, currentTimeSeconds?: number) => {
      if (!courseId) return;
      fetch(`/api/courses/${courseId}/videos/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: dbVideoId ?? videoId,
          percentWatched: currentPercent,
          chapterId,
          maxPositionSeconds: currentTimeSeconds ?? 0,
        }),
      }).catch(() => {});
      const now = Date.now();
      if (now - lastProgressEventRef.current > 30000) {
        lastProgressEventRef.current = now;
        window.dispatchEvent(
          new CustomEvent("embra:progress-updated", {
            detail: { courseId, chapterId },
          })
        );
      }
    },
    [courseId, dbVideoId, videoId, chapterId]
  );

  const flushProgress = useCallback(() => {
    if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return;
    try {
      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();
      if (duration > 0) {
        const pct = (currentTime / duration) * 100;
        const roundedPct = Math.round(pct * 100) / 100;
        savePosition(currentTime, duration, roundedPct);
        syncProgressToCourse(roundedPct, Math.round(currentTime));
      }
    } catch {
      // Player might be in a bad state
    }
  }, [savePosition, syncProgressToCourse]);

  const startTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return;
      try {
        const state = playerRef.current.getPlayerState();
        if (state !== (window.YT?.PlayerState?.PLAYING ?? 1)) return;

        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration <= 0) return;
        const pct = Math.round((currentTime / duration) * 10000) / 100;

        savePosition(currentTime, duration, pct);
        syncProgressToCourse(pct, Math.round(currentTime));

        if (pct >= 90 && !completedFiredRef.current) {
          completedFiredRef.current = true;
          onComplete?.();
        }
      } catch {
        // swallow
      }
    }, SAVE_INTERVAL_MS);
  }, [savePosition, onComplete, syncProgressToCourse]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    flushProgress();
  }, [flushProgress]);

  const initPlayer = useCallback(async (syncedData: VideoProgress | null) => {
    await loadYouTubeApi();
    if (!playerContainerRef.current) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    const saved = syncedData ?? getSavedPosition();
    const shouldResume =
      saved &&
      saved.currentTime > 0 &&
      saved.percentWatched > 0 &&
      saved.percentWatched < 95;

    const player = new window.YT!.Player(playerContainerRef.current, {
      videoId,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
        controls: 1,
      },
      events: {
        onReady: (event) => {
          setIsReady(true);

          if (shouldResume) {
            event.target.seekTo(saved!.currentTime, true);
            resumeDataRef.current = {
              currentTime: saved!.currentTime,
              percentWatched: saved!.percentWatched,
            };
            setShowResumeToast(true);
          }

          if (saved && saved.percentWatched >= 95) {
            completedFiredRef.current = true;
            onComplete?.();
          }
        },
        onStateChange: (event) => {
          const PLAYING = window.YT?.PlayerState?.PLAYING ?? 1;
          const PAUSED = window.YT?.PlayerState?.PAUSED ?? 2;
          const ENDED = window.YT?.PlayerState?.ENDED ?? 0;

          if (event.data === PLAYING) {
            startTracking();
          } else if (event.data === PAUSED) {
            stopTracking();
          } else if (event.data === ENDED) {
            stopTracking();
            if (!completedFiredRef.current) {
              completedFiredRef.current = true;
              if (playerRef.current) {
                try {
                  const d = playerRef.current.getDuration();
                  if (d > 0) {
                    savePosition(d, d, 100);
                  }
                } catch { /* ignore */ }
              }
              onComplete?.();
            }
          }
        },
        onError: () => {
          setIsReady(false);
        },
      },
    });

    playerRef.current = player;
  }, [videoId, getSavedPosition, startTracking, stopTracking, savePosition, onComplete]);

  const handlePlay = useCallback(async () => {
    setClicked(true);
    const syncedData = syncLocalToStore();

    requestAnimationFrame(async () => {
      await new Promise((r) => setTimeout(r, 50));
      await initPlayer(syncedData);
    });
  }, [initPlayer, syncLocalToStore]);

  const handleWatchFromBeginning = useCallback(() => {
    setShowResumeToast(false);
    if (playerRef.current) {
      playerRef.current.seekTo(0, true);
    }
  }, []);

  const handleDismissToast = useCallback(() => {
    setShowResumeToast(false);
    resumeDataRef.current = null;
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushProgress();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopTracking();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch { /* ignore */ }
        playerRef.current = null;
      }
    };
  }, [flushProgress, stopTracking]);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className={className}>
      <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
        {!clicked ? (
          <button
            onClick={handlePlay}
            className="relative w-full h-full group"
            aria-label={`Play: ${title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
              <div className="flex flex-col items-center gap-3">
                <PlayCircle className="h-16 w-16 text-white drop-shadow-lg group-hover:scale-105 transition-transform" />
                {!compact && (
                  <span className="text-white text-sm font-medium drop-shadow px-4 text-center max-w-sm leading-snug">
                    {title}
                  </span>
                )}
              </div>
            </div>
          </button>
        ) : (
          <>
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              </div>
            )}
            <div
              ref={playerContainerRef}
              className="absolute inset-0 w-full h-full"
            />
            {showResumeToast && resumeDataRef.current && (
              <ResumeToast
                savedTime={resumeDataRef.current.currentTime}
                percentWatched={resumeDataRef.current.percentWatched}
                onDismiss={handleDismissToast}
                onWatchFromBeginning={handleWatchFromBeginning}
              />
            )}
          </>
        )}
      </div>

      {/* Progress bar */}
      {clicked && (
        <VideoProgressBar percentWatched={percentWatched} />
      )}

      {/* Title bar */}
      {!compact && (
        <div
          className="px-3 py-2 flex items-center justify-between gap-2"
          style={{ background: "rgba(255,253,245,0.05)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <p
              className="text-xs truncate font-jetbrains"
              style={{ color: "#5C4E35" }}
            >
              {title}
            </p>
            {isCompleted && (
              <span
                className="font-jetbrains text-[9px] px-1.5 py-0.5 shrink-0"
                style={{
                  background: "#E8F5E9",
                  border: "1px solid #059669",
                  color: "#059669",
                }}
              >
                Completed ✓
              </span>
            )}
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-jetbrains shrink-0 hover:underline"
            style={{ color: "#A08E6B" }}
          >
            YouTube ↗
          </a>
        </div>
      )}
    </div>
  );
}
