import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { tagListStorage, settingsStorage } from '@/storage';
import type { SettingsProps } from '@/types/settings';
import type { TagItem } from '@/types/tab';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SettingsProps;
  onUpdateSettings: (patch: Partial<SettingsProps>) => void;
}

interface ExportData {
  version: 1;
  exportedAt: string;
  tags: TagItem[];
  settings: SettingsProps;
}

const DISPLAY_LIMIT_OPTIONS = [25, 50, 100, 200, 500];

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
}: SettingsDialogProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = async () => {
    const tags = await tagListStorage.getValue();
    const currentSettings = await settingsStorage.getValue();

    const data: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tags: tags ?? [],
      settings: currentSettings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabclue-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      if (!data.version || !Array.isArray(data.tags)) {
        throw new Error('Invalid format');
      }

      await tagListStorage.setValue(data.tags);
      if (data.settings) {
        await settingsStorage.setValue(data.settings);
      }

      setImportStatus('success');
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{t('settingsTitle')}</DialogTitle>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          {/* Display section */}
          <div>
            <h3 className="text-sm font-medium mb-3">{t('display')}</h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={settings.showFavicons}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({ showFavicons: checked })
                  }
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <span className="text-sm font-medium leading-none">
                    {t('showFavicons')}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {t('showFaviconsDescription')}
                  </p>
                </div>
              </label>

              <div className="flex items-start gap-3">
                <div className="space-y-1 flex-1">
                  <span className="text-sm font-medium leading-none">
                    {t('displayLimit')}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {t('displayLimitDescription')}
                  </p>
                </div>
                <select
                  value={settings.displayLimit}
                  onChange={(e) =>
                    onUpdateSettings({ displayLimit: Number(e.target.value) })
                  }
                  className="h-8 rounded-md border bg-background px-2 text-sm"
                >
                  {DISPLAY_LIMIT_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data management section */}
          <div>
            <h3 className="text-sm font-medium mb-3">{t('dataManagement')}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="space-y-1 flex-1">
                  <span className="text-sm font-medium leading-none">
                    {t('exportData')}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {t('exportDataDescription')}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  {t('exportData')}
                </Button>
              </div>

              <div className="flex items-start gap-3">
                <div className="space-y-1 flex-1">
                  <span className="text-sm font-medium leading-none">
                    {t('importData')}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {t('importDataDescription')}
                  </p>
                  {importStatus === 'success' && (
                    <p className="text-xs text-green-600">{t('importSuccess')}</p>
                  )}
                  {importStatus === 'error' && (
                    <p className="text-xs text-destructive">{t('importError')}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {t('importData')}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
