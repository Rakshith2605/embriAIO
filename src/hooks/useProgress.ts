import { useProgressContext } from "@/context/ProgressContext";
import { ChapterId, CompletionStatus, VideoProgress } from "@/types/curriculum";
import { useCurriculum } from "@/context/CurriculumContext";

export function useProgress(chapterId: ChapterId) {
  const { state, dispatch, isHydrated } = useProgressContext();
  const curriculum = useCurriculum();
  const chapterProgress = state.chapters[chapterId];
  const allChapters = [...curriculum.chapters, ...curriculum.appendices];
  const chapter = allChapters.find((c) => c.id === chapterId) ?? null;
  const totalNotebooks = chapter?.mainNotebooks.length ?? 0;
  const totalVideos = (chapter?.video ? 1 : 0) + (chapter?.extraVideos?.length ?? 0);

  const completedCount = Object.values(chapterProgress?.notebookProgress ?? {}).filter(
    (n) => n.status === "completed"
  ).length;

  const completedVideoCount = Object.values(chapterProgress?.videoProgress ?? {}).filter(
    (v) => v.percentWatched >= 90
  ).length;

  const totalItems = totalNotebooks + totalVideos;
  const completedItems = completedCount + completedVideoCount;

  const percentComplete = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  function getNotebookStatus(notebookSlug: string): CompletionStatus {
    return chapterProgress?.notebookProgress[notebookSlug]?.status ?? "not_started";
  }

  function getVideoProgress(videoId: string): VideoProgress | null {
    return chapterProgress?.videoProgress[videoId] ?? null;
  }

  function getVideoPercentWatched(videoId: string): number {
    return chapterProgress?.videoProgress[videoId]?.percentWatched ?? 0;
  }

  function isVideoCompleted(videoId: string): boolean {
    return (chapterProgress?.videoProgress[videoId]?.percentWatched ?? 0) >= 90;
  }

  function markComplete(notebookSlug: string) {
    dispatch({ type: "MARK_NOTEBOOK_COMPLETE", chapterId, notebookSlug });
  }

  function markInProgress(notebookSlug: string) {
    dispatch({ type: "MARK_NOTEBOOK_IN_PROGRESS", chapterId, notebookSlug });
  }

  function resetNotebook(notebookSlug: string) {
    dispatch({ type: "RESET_NOTEBOOK", chapterId, notebookSlug });
  }

  function markVideoWatched(videoId?: string) {
    dispatch({ type: "MARK_VIDEO_WATCHED", chapterId, videoId });
  }

  return {
    isHydrated,
    completedCount,
    totalNotebooks,
    totalVideos,
    completedVideoCount,
    totalItems,
    completedItems,
    percentComplete,
    videoWatched: chapterProgress?.videoWatched ?? false,
    getNotebookStatus,
    getVideoProgress,
    getVideoPercentWatched,
    isVideoCompleted,
    markComplete,
    markInProgress,
    resetNotebook,
    markVideoWatched,
  };
}

export function useOverallProgress() {
  const { state, isHydrated } = useProgressContext();

  let totalNotebooks = 0;
  let completedNotebooks = 0;
  let totalVideos = 0;
  let completedVideos = 0;

  Object.values(state.chapters).forEach((cp) => {
    Object.values(cp.notebookProgress).forEach((np) => {
      totalNotebooks++;
      if (np.status === "completed") completedNotebooks++;
    });
    Object.values(cp.videoProgress).forEach((vp) => {
      totalVideos++;
      if (vp.percentWatched >= 90) completedVideos++;
    });
  });

  const totalItems = totalNotebooks + totalVideos;
  const completedItems = completedNotebooks + completedVideos;

  return {
    isHydrated,
    totalNotebooks,
    completedNotebooks,
    totalVideos,
    completedVideos,
    totalItems,
    completedItems,
    percentComplete: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
  };
}
