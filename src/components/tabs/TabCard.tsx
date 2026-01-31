import { useTranslation } from 'react-i18next';
import { ExternalLink, Pencil, Trash2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { FaviconImage } from '@/components/common/FaviconImage';
import { timeAgo } from '@/lib/date';
import type { TabItem } from '@/types/tab';

interface TabCardProps {
  tab: TabItem;
  isSelected: boolean;
  isBookmarked?: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onOpen: () => void;
}

export function TabCard({
  tab,
  isSelected,
  isBookmarked,
  onToggleSelect,
  onDelete,
  onEdit,
  onOpen,
}: TabCardProps) {
  const { t, i18n } = useTranslation();

  return (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-3 border-b hover:bg-accent/50 transition-colors',
        isSelected && 'bg-accent/30'
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggleSelect}
        className="mt-0.5"
      />

      <FaviconImage url={tab.url} favIconUrl={tab.favIconUrl} className="h-4 w-4 mt-0.5 shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpen}
            className="text-sm font-medium truncate hover:text-primary hover:underline text-left"
            title={tab.title}
          >
            {tab.title}
          </button>
          {isBookmarked && (
            <Bookmark className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5" title={tab.url}>
          {tab.url}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {t('savedAgo', { time: timeAgo(tab.savedAt, i18n.language) })}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onOpen} title={t('open')}>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} title={t('edit')}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={onDelete}
          title={t('delete')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
