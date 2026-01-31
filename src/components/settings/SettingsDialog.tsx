import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { SettingsProps } from '@/types/settings';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: SettingsProps;
  onUpdateSettings: (patch: Partial<SettingsProps>) => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
}: SettingsDialogProps) {
  const { t } = useTranslation();

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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
