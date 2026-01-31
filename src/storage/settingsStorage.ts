import { storage } from 'wxt/utils/storage';
import type { SettingsProps } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { STORAGE_KEYS } from '@/types/storage';

export const settingsStorage = storage.defineItem<SettingsProps>(
  STORAGE_KEYS.SETTINGS,
  {
    fallback: DEFAULT_SETTINGS,
  }
);
