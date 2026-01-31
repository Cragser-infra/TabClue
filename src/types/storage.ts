export const STORAGE_KEYS = {
  TAG_LIST: 'local:tagList',
  SETTINGS: 'local:settings',
  RECYCLE_BIN: 'local:recycleBin',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
