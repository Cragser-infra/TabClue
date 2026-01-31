import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink } from 'lucide-react';

interface ContentHeaderProps {
  title: string;
  tabCount: number;
  selectedCount: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
  onOpenSelected: () => void;
}

export function ContentHeader({
  title,
  tabCount,
  selectedCount,
  allSelected,
  onToggleSelectAll,
  onDeleteSelected,
  onOpenSelected,
}: ContentHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b bg-background">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">
          {t('tabs', { count: tabCount })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <>
            <span className="text-sm text-muted-foreground">
              {t('selected', { count: selectedCount })}
            </span>
            <Button variant="ghost" size="sm" onClick={onOpenSelected}>
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              {t('openSelected')}
            </Button>
            <Button variant="ghost" size="sm" onClick={onDeleteSelected} className="text-destructive">
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              {t('deleteSelected')}
            </Button>
          </>
        )}
        <div className="flex items-center gap-1.5">
          <Checkbox checked={allSelected && tabCount > 0} onCheckedChange={onToggleSelectAll} />
          <span className="text-xs text-muted-foreground">
            {allSelected ? t('deselectAll') : t('selectAll')}
          </span>
        </div>
      </div>
    </div>
  );
}
