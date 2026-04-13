import { useProgressContext } from "@/context/ProgressContext";
import { ChapterId, CompletionStatus } from "@/types/curriculum";
import { getChapterById } from "@/lib/curriculum";

export function useProgress(chapterId: ChapterId) {
  const { state, dispatch, isHydrated } = useProgressContext();
  const chapterProgress = state.chapters[chapterId];
  const chapter = getChapterById(chapterId);
  const totalNotebooks = chapter?.mainNotebooks.length ?? 0;

  const completedCount = Object.values(chapterProgress?.notebookProgress ?? {}).filter(
    (n) => n.status === "completed"
  ).length;

  const percentComplete = totalNotebooks > 0 ? Math.round((completedCount / totalNotebooks) * 100) : 0;

  function getNotebookStatus(notebookSlug: string): CompletionStatus {
    return chapterProgress?.notebookProgress[notebookSlug]?.status ?? "not_started";
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

  function markVideoWatched() {
    dispatch({ type: "MARK_VIDEO_WATCHED", chapterId });
  }

  return {
    isHydrated,
    completedCount,
    totalNotebooks,
    percentComplete,
    videoWatched: chapterProgress?.videoWatched ?? false,
    getNotebookStatus,
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

  Object.values(state.chapters).forEach((cp) => {
    Object.values(cp.notebookProgress).forEach((np) => {
      totalNotebooks++;
      if (np.status === "completed") completedNotebooks++;
    });
  });

  return {
    isHydrated,
    totalNotebooks,
    completedNotebooks,
    percentComplete: totalNotebooks > 0 ? Math.round((completedNotebooks / totalNotebooks) * 100) : 0,
  };
}
