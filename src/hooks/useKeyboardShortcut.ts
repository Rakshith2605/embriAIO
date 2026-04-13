"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {}
) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const metaOrCtrl = options.metaKey ? e.metaKey : options.ctrlKey ? e.ctrlKey : e.metaKey || e.ctrlKey;
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        metaOrCtrl &&
        (options.shiftKey === undefined || e.shiftKey === options.shiftKey)
      ) {
        e.preventDefault();
        callback();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options.metaKey, options.ctrlKey, options.shiftKey]);
}
