import { useMemo } from 'react';
import type { TagItem, DomainGroup } from '@/types/tab';

export function useGroupedBySite(tags: TagItem[] | null): DomainGroup[] {
  return useMemo(() => {
    if (!tags) return [];

    const domainMap = new Map<string, DomainGroup>();

    for (const tag of tags) {
      for (const group of tag.groups) {
        for (const tab of group.tabs) {
          const existing = domainMap.get(tab.domain);
          if (existing) {
            existing.tabs.push(tab);
            existing.totalCount++;
          } else {
            domainMap.set(tab.domain, {
              domain: tab.domain,
              favIconUrl: tab.favIconUrl,
              tabs: [tab],
              totalCount: 1,
            });
          }
        }
      }
    }

    return Array.from(domainMap.values()).sort((a, b) => b.totalCount - a.totalCount);
  }, [tags]);
}
