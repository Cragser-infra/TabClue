export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark' | 'system';

export interface SettingsProps {
  language: Language;
  theme: Theme;
  closeTabsAfterSave: boolean;
  showCloseConfirmation: boolean;
  defaultTagId: string;
  virtualScrollThreshold: number;
  showFavicons: boolean;
}

export const DEFAULT_SETTINGS: SettingsProps = {
  language: 'en',
  theme: 'system',
  closeTabsAfterSave: true,
  showCloseConfirmation: true,
  defaultTagId: 'staging-area',
  virtualScrollThreshold: 100,
  showFavicons: false,
};
