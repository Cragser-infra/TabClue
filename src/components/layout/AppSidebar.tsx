import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Search,
  Settings,
  Globe,
  Clock,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FaviconImage } from '@/components/common/FaviconImage';
import type { DashboardView } from '@/components/dashboard/DashboardTabs';
import type { GroupItem, MostVisitedItem, DomainGroup } from '@/types/tab';

// --- Sidebar item types per view ---

export interface SessionSidebarItem {
  id: string;
  label: string;
  count: number;
}

export interface SiteSidebarItem {
  domain: string;
  count: number;
  favIconUrl?: string;
}

export interface RankSidebarItem {
  id: string;
  label: string;
  range: [number, number]; // [from, to] indices
  count: number;
}

interface AppSidebarProps {
  activeView: DashboardView;
  // Complete list data
  sessions: SessionSidebarItem[];
  selectedSessionId: string | null;
  onSelectSession: (id: string | null) => void;
  // Grouped by site data
  sites: SiteSidebarItem[];
  selectedSite: string | null;
  onSelectSite: (domain: string | null) => void;
  // Most visited data
  ranks: RankSidebarItem[];
  selectedRank: string | null;
  onSelectRank: (id: string | null) => void;
  // Common
  collapsed: boolean;
  onToggleSidebar: () => void;
  showFavicons: boolean;
  onOpenSettings: () => void;
}

export function AppSidebar({
  activeView,
  sessions,
  selectedSessionId,
  onSelectSession,
  sites,
  selectedSite,
  onSelectSite,
  ranks,
  selectedRank,
  onSelectRank,
  collapsed,
  onToggleSidebar,
  showFavicons,
  onOpenSettings,
}: AppSidebarProps) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('tabclue-language', next);
  };

  // Filter items based on search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) => s.label.toLowerCase().includes(q));
  }, [sessions, searchQuery]);

  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return sites;
    const q = searchQuery.toLowerCase();
    return sites.filter((s) => s.domain.toLowerCase().includes(q));
  }, [sites, searchQuery]);

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
        {activeView !== 'most-visited' && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={
                activeView === 'complete-list'
                  ? t('sidebar:searchSessions')
                  : t('sidebar:searchSites')
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Contextual content */}
      <ScrollArea className="flex-1 p-2">
        {activeView === 'complete-list' && (
          <SessionList
            sessions={filteredSessions}
            selectedId={selectedSessionId}
            onSelect={onSelectSession}
          />
        )}
        {activeView === 'grouped-by-site' && (
          <SiteList
            sites={filteredSites}
            selectedDomain={selectedSite}
            onSelect={onSelectSite}
            showFavicons={showFavicons}
          />
        )}
        {activeView === 'most-visited' && (
          <RankList
            ranks={ranks}
            selectedId={selectedRank}
            onSelect={onSelectRank}
          />
        )}
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-xs gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          {i18n.language.toUpperCase()}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}

// --- Complete List: sessions ---

function SessionList({
  sessions,
  selectedId,
  onSelect,
}: {
  sessions: SessionSidebarItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-0.5">
      {/* "All" option */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex items-center w-full px-2 py-1.5 rounded-md text-sm hover:bg-sidebar-accent transition-colors',
          selectedId === null && 'bg-sidebar-accent font-medium'
        )}
      >
        <Clock className="h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left">{t('sidebar:allSessions')}</span>
      </button>

      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => onSelect(session.id)}
          className={cn(
            'flex items-center w-full px-2 py-1.5 rounded-md text-xs hover:bg-sidebar-accent transition-colors',
            selectedId === session.id && 'bg-sidebar-accent font-medium'
          )}
        >
          <span className="truncate flex-1 text-left">{session.label}</span>
          <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
            {session.count}
          </Badge>
        </button>
      ))}

      {sessions.length === 0 && (
        <p className="text-[10px] text-muted-foreground px-2 py-4 text-center italic">
          {t('sidebar:noResults')}
        </p>
      )}
    </div>
  );
}

// --- Grouped by Site: domains ---

function SiteList({
  sites,
  selectedDomain,
  onSelect,
  showFavicons,
}: {
  sites: SiteSidebarItem[];
  selectedDomain: string | null;
  onSelect: (domain: string | null) => void;
  showFavicons: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-0.5">
      {/* "All" option */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex items-center w-full px-2 py-1.5 rounded-md text-sm hover:bg-sidebar-accent transition-colors',
          selectedDomain === null && 'bg-sidebar-accent font-medium'
        )}
      >
        <Globe className="h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left">{t('sidebar:allSites')}</span>
      </button>

      {sites.map((site) => (
        <button
          key={site.domain}
          onClick={() => onSelect(site.domain)}
          className={cn(
            'flex items-center w-full px-2 py-1.5 rounded-md text-xs hover:bg-sidebar-accent transition-colors',
            selectedDomain === site.domain && 'bg-sidebar-accent font-medium'
          )}
        >
          <FaviconImage
            url={`https://${site.domain}`}
            favIconUrl={site.favIconUrl}
            className="h-3.5 w-3.5 mr-2 shrink-0"
            visible={showFavicons}
          />
          <span className="truncate flex-1 text-left">{site.domain}</span>
          <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
            {site.count}
          </Badge>
        </button>
      ))}

      {sites.length === 0 && (
        <p className="text-[10px] text-muted-foreground px-2 py-4 text-center italic">
          {t('sidebar:noResults')}
        </p>
      )}
    </div>
  );
}

// --- Most Visited: rank tiers ---

function RankList({
  ranks,
  selectedId,
  onSelect,
}: {
  ranks: RankSidebarItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-0.5">
      {/* "All" option */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex items-center w-full px-2 py-1.5 rounded-md text-sm hover:bg-sidebar-accent transition-colors',
          selectedId === null && 'bg-sidebar-accent font-medium'
        )}
      >
        <Trophy className="h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left">{t('sidebar:allRanks')}</span>
      </button>

      {ranks.map((rank) => (
        <button
          key={rank.id}
          onClick={() => onSelect(rank.id)}
          className={cn(
            'flex items-center w-full px-2 py-1.5 rounded-md text-xs hover:bg-sidebar-accent transition-colors',
            selectedId === rank.id && 'bg-sidebar-accent font-medium'
          )}
        >
          <span className="truncate flex-1 text-left">{rank.label}</span>
          <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
            {rank.count}
          </Badge>
        </button>
      ))}
    </div>
  );
}
