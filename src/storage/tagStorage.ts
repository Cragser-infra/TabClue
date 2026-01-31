import { storage } from 'wxt/utils/storage';
import type { TagItem } from '@/types/tab';
import { STORAGE_KEYS } from '@/types/storage';

export const tagListStorage = storage.defineItem<TagItem[]>(
  STORAGE_KEYS.TAG_LIST,
  {
    fallback: [
      {
        id: 'staging-area',
        name: 'Staging Area',
        createdAt: new Date().toISOString(),
        groups: [],
        isSystem: true,
        isLocked: false,
        isCollapsed: false,
      },
    ],
  }
);

export const recycleBinStorage = storage.defineItem<TagItem[]>(
  STORAGE_KEYS.RECYCLE_BIN,
  { fallback: [] }
);
