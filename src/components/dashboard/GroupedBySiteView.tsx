import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaviconImage } from '@/components/common/FaviconImage';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DomainGroup } from '@/types/tab';

interface GroupedBySiteViewProps {
  groups: DomainGroup[];
  showFavicons?: boolean;
  onOpen: (url: string) => void;
}

export function GroupedBySiteView({ groups, showFavicons = true, onOpen }: GroupedBySiteViewProps) {
  const { t } = useTranslation('dashboard');
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set());

  const toggleDomain = (domain: string) => {
    setCollapsedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('emptyState')}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {groups.map((group) => {
          const isCollapsed = collapsedDomains.has(group.domain);
          return (
            <div key={group.domain}>
              {/* Domain Header */}
              <button
                onClick={() => toggleDomain(group.domain)}
                className="flex items-center w-full px-4 py-3 hover:bg-accent/50 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 mr-2 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2 shrink-0" />
                )}
                <FaviconImage
                  url={`https://${group.domain}`}
                  favIconUrl={group.favIconUrl}
                  className="h-4 w-4 mr-2 shrink-0"
                  visible={showFavicons}
                />
                <span className="text-sm font-medium">{group.domain}</span>
                <Badge variant="secondary" className="ml-auto">
                  {t('tabsInDomain', { count: group.totalCount, domain: '' }).replace(' in ', '')}
                </Badge>
              </button>

              {/* Tabs within domain */}
              {!isCollapsed && (
                <div className="bg-accent/20">
                  {group.tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className="group flex items-center gap-3 pl-12 pr-4 py-2 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => onOpen(tab.url)}
                          className="text-sm truncate hover:text-primary hover:underline block text-left w-full"
                          title={tab.title}
                        >
                          {tab.title}
                        </button>
                        <p className="text-xs text-muted-foreground truncate" title={tab.url}>
                          {tab.url}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                        onClick={() => onOpen(tab.url)}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
