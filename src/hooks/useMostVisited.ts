import { useMemo } from 'react';
import type { TagItem, MostVisitedItem } from '@/types/tab';

export function useMostVisited(tags: TagItem[] | null): MostVisitedItem[] {
  return useMemo(() => {
    if (!tags) return [];

    const urlMap = new Map<string, MostVisitedItem>();

    for (const tag of tags) {
      for (const group of tag.groups) {
        for (const tab of group.tabs) {
          const existing = urlMap.get(tab.url);
          if (existing) {
            existing.count++;
            if (tab.savedAt > existing.lastSavedAt) {
              existing.lastSavedAt = tab.savedAt;
              existing.title = tab.title;
              existing.favIconUrl = tab.favIconUrl;
            }
          } else {
            urlMap.set(tab.url, {
              url: tab.url,
              title: tab.title,
              domain: tab.domain,
              favIconUrl: tab.favIconUrl,
              count: 1,
              lastSavedAt: tab.savedAt,
            });
          }
        }
      }
    }

    return Array.from(urlMap.values()).sort((a, b) => b.count - a.count);
  }, [tags]);
}
