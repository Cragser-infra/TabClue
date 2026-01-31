import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Layers,
  Search,
  Settings,
  Globe,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { TagItem } from '@/types/tab';

interface AppSidebarProps {
  tags: TagItem[];
  selectedGroupId: string | null;
  selectedTagId: string | null;
  onSelectGroup: (tagId: string, groupId: string) => void;
  onSelectTag: (tagId: string) => void;
  onToggleCollapse: (tagId: string) => void;
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export function AppSidebar({
  tags,
  selectedGroupId,
  selectedTagId,
  onSelectGroup,
  onSelectTag,
  onToggleCollapse,
  collapsed,
  onToggleSidebar,
}: AppSidebarProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const q = searchQuery.toLowerCase();
    return tags
      .map((tag) => ({
        ...tag,
        groups: tag.groups.filter(
          (g) =>
            g.name.toLowerCase().includes(q) ||
            g.tabs.some(
              (tab) =>
                tab.title.toLowerCase().includes(q) ||
                tab.url.toLowerCase().includes(q)
            )
        ),
      }))
      .filter(
        (tag) =>
          tag.name.toLowerCase().includes(q) || tag.groups.length > 0
      );
  }, [tags, searchQuery]);

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('tabclue-language', next);
  };

  if (collapsed) {
    return (
      <aside className="w-12 border-r bg-sidebar-background flex flex-col items-center py-3 gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-sidebar-accent"
          title={t('appName')}
        >
          <Layers className="h-5 w-5" />
        </button>
        <Separator />
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onSelectTag(tag.id)}
            className={cn(
              'p-2 rounded-md hover:bg-sidebar-accent',
              selectedTagId === tag.id && 'bg-sidebar-accent'
            )}
            title={tag.name}
          >
            <Folder className="h-4 w-4" />
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r bg-sidebar-background flex flex-col h-full">
      {/* Header */}
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            {t('appName')}
          </h1>
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded-md hover:bg-sidebar-accent text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t('sidebar:searchTags')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <Separator />

      {/* Tag Tree */}
      <ScrollArea className="flex-1 p-2">
        {filteredTags.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-4 text-center">
            {t('sidebar:noTagsFound')}
          </p>
        ) : (
          filteredTags.map((tag) => (
            <div key={tag.id} className="mb-1">
              {/* Tag Header */}
              <button
                onClick={() => onToggleCollapse(tag.id)}
                className={cn(
                  'flex items-center w-full px-2 py-1.5 rounded-md text-sm font-medium hover:bg-sidebar-accent transition-colors',
                  selectedTagId === tag.id && !selectedGroupId && 'bg-sidebar-accent'
                )}
              >
                {tag.isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 mr-1 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 mr-1 shrink-0" />
                )}
                {tag.isCollapsed ? (
                  <Folder className="h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
                ) : (
                  <FolderOpen className="h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate flex-1 text-left">{tag.name}</span>
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                  {tag.groups.reduce((sum, g) => sum + g.tabs.length, 0)}
                </Badge>
              </button>

              {/* Groups */}
              {!tag.isCollapsed && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {tag.groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => onSelectGroup(tag.id, group.id)}
                      className={cn(
                        'flex items-center w-full px-2 py-1 rounded-md text-xs hover:bg-sidebar-accent transition-colors',
                        selectedGroupId === group.id &&
                          'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      )}
                    >
                      <span className="truncate flex-1 text-left">{group.name}</span>
                      <span className="text-muted-foreground ml-2 text-[10px]">
                        {group.tabs.length}
                      </span>
                    </button>
                  ))}
                  {tag.groups.length === 0 && (
                    <p className="text-[10px] text-muted-foreground px-2 py-1 italic">
                      {t('dashboard:emptyGroup')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-xs gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          {i18n.language.toUpperCase()}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
