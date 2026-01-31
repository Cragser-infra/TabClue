import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaviconImage } from '@/components/common/FaviconImage';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { MostVisitedItem } from '@/types/tab';

interface MostVisitedViewProps {
  items: MostVisitedItem[];
  showFavicons?: boolean;
  onOpen: (url: string) => void;
}

export function MostVisitedView({ items, showFavicons = true, onOpen }: MostVisitedViewProps) {
  const { t } = useTranslation('dashboard');

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('emptyState')}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {items.map((item) => (
          <div
            key={item.url}
            className="group flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
          >
            <FaviconImage url={item.url} favIconUrl={item.favIconUrl} className="h-4 w-4 shrink-0" visible={showFavicons} />

            <div className="flex-1 min-w-0">
              <button
                onClick={() => onOpen(item.url)}
                className="text-sm font-medium truncate hover:text-primary hover:underline block text-left w-full"
                title={item.title}
              >
                {item.title}
              </button>
              <p className="text-xs text-muted-foreground truncate" title={item.url}>
                {item.domain}
              </p>
            </div>

            <Badge variant="secondary" className="shrink-0">
              {t('visitCount', { count: item.count })}
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
              onClick={() => onOpen(item.url)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
