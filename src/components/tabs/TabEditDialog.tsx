import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { TabItem } from '@/types/tab';

interface TabEditDialogProps {
  tab: TabItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, title: string, url: string) => void;
}

export function TabEditDialog({ tab, open, onOpenChange, onSave }: TabEditDialogProps) {
  const { t } = useTranslation('dialogs');
  const [title, setTitle] = useState(tab?.title ?? '');
  const [url, setUrl] = useState(tab?.url ?? '');

  const handleSave = () => {
    if (tab) {
      onSave(tab.id, title, url);
      onOpenChange(false);
    }
  };

  // Sync state when tab changes
  if (tab && title === '' && url === '') {
    setTitle(tab.title);
    setUrl(tab.url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{t('editTabTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('editTabName')}</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('editTabUrl')}</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:cancel')}
          </Button>
          <Button onClick={handleSave}>{t('common:save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
