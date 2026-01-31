import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RuntimeMessage } from '@/types/messages';

export default function App() {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    savedCount: number;
    tabIds: number[];
  } | null>(null);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SAVE_ALL_TABS',
      } satisfies RuntimeMessage);

      if (response?.success) {
        setSaveResult({
          savedCount: response.savedCount,
          tabIds: response.tabIds,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCloseTabs = async () => {
    if (saveResult) {
      await chrome.runtime.sendMessage({
        type: 'CLOSE_SAVED_TABS',
        payload: { tabIds: saveResult.tabIds },
      } satisfies RuntimeMessage);
      setSaveResult(null);
    }
  };

  const handleKeepOpen = () => {
    setSaveResult(null);
  };

  const handleOpenDashboard = async () => {
    await chrome.runtime.sendMessage({
      type: 'OPEN_DASHBOARD',
    } satisfies RuntimeMessage);
    window.close();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t('appName')}</h1>
        <button
          onClick={handleOpenDashboard}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {t('settings')}
        </button>
      </div>

      {saveResult ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-green-600">
            {t('dialogs:saveConfirmMessage', { count: saveResult.savedCount })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('dialogs:closeTabsQuestion')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCloseTabs}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              {t('dialogs:closeTabs')}
            </button>
            <button
              onClick={handleKeepOpen}
              className="flex-1 px-3 py-2 text-sm font-medium border rounded-md hover:bg-secondary"
            >
              {t('dialogs:keepOpen')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? '...' : t('save') + ' ' + t('tabs', { count: 0 }).replace('0 ', '')}
          </button>
          <button
            onClick={handleOpenDashboard}
            className="w-full px-4 py-2 text-sm font-medium border rounded-md hover:bg-secondary"
          >
            {t('dashboard:completeList')}
          </button>
        </div>
      )}
    </div>
  );
}
