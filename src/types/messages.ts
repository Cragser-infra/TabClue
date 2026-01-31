export type RuntimeMessage =
  | { type: 'SAVE_ALL_TABS'; payload?: { targetTagId?: string } }
  | { type: 'SAVE_ALL_TABS_RESULT'; payload: { success: boolean; savedCount: number; groupId: string; tabIds: number[] } }
  | { type: 'CLOSE_SAVED_TABS'; payload: { tabIds: number[] } }
  | { type: 'OPEN_DASHBOARD'; payload?: { path?: string } }
  | { type: 'REFRESH_DATA' }
  | { type: 'GET_BOOKMARK_STATUS'; payload: { urls: string[] } }
  | { type: 'BOOKMARK_STATUS_RESULT'; payload: Record<string, boolean> };
