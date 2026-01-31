import { useState, useEffect, useCallback } from 'react';

export function useBookmarkCheck(urls: string[]) {
  const [bookmarkStatus, setBookmarkStatus] = useState<Map<string, boolean>>(new Map());

  const checkUrls = useCallback(async (urlsToCheck: string[]) => {
    if (typeof chrome === 'undefined' || !chrome.bookmarks) return;

    const unchecked = urlsToCheck.filter((u) => !bookmarkStatus.has(u));
    if (unchecked.length === 0) return;

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_BOOKMARK_STATUS',
        payload: { urls: unchecked },
      });

      if (response?.payload) {
        setBookmarkStatus((prev) => {
          const next = new Map(prev);
          for (const [url, isBookmarked] of Object.entries(response.payload)) {
            next.set(url, isBookmarked as boolean);
          }
          return next;
        });
      }
    } catch {
      // Extension context may not be available
    }
  }, [bookmarkStatus]);

  useEffect(() => {
    if (urls.length > 0) {
      checkUrls(urls);
    }
  }, [urls, checkUrls]);

  return bookmarkStatus;
}
