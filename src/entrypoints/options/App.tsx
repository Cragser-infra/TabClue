import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStorage } from '@/hooks/useStorage';
import { useTabSelection } from '@/hooks/useTabSelection';
import { useMostVisited } from '@/hooks/useMostVisited';
import { useGroupedBySite } from '@/hooks/useGroupedBySite';
import { useBookmarkCheck } from '@/hooks/useBookmarkCheck';
import { tagListStorage, settingsStorage } from '@/storage';
import type { SettingsProps } from '@/types/settings';
import {
  AppSidebar,
  type SessionSidebarItem,
  type SiteSidebarItem,
  type RankSidebarItem,
} from '@/components/layout/AppSidebar';
import { ContentHeader } from '@/components/layout/ContentHeader';
import { DashboardTabs, type DashboardView } from '@/components/dashboard/DashboardTabs';
import { MostVisitedView } from '@/components/dashboard/MostVisitedView';
import { GroupedBySiteView } from '@/components/dashboard/GroupedBySiteView';
import { CompleteListView } from '@/components/dashboard/CompleteListView';
import { TabEditDialog } from '@/components/tabs/TabEditDialog';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import type { TabItem } from '@/types/tab';

export default function App() {
  const { t } = useTranslation();
  const { value: tags, isLoading } = useStorage(tagListStorage);
  const { value: settings } = useStorage(settingsStorage);

  const [activeView, setActiveView] = useState<DashboardView>('complete-list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingTab, setEditingTab] = useState<TabItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sidebar selections per view
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);

  const { selectedIds, toggle, selectAll, deselectAll, isAllSelected } = useTabSelection();

  // All tabs flat
  const allTabs = useMemo(
    () => tags?.flatMap((tag) => tag.groups.flatMap((g) => g.tabs)) ?? [],
    [tags]
  );

  // --- Sidebar data ---

  // Sessions for "Complete List"
  const sessions: SessionSidebarItem[] = useMemo(() => {
    if (!tags) return [];
    return tags.flatMap((tag) =>
      tag.groups.map((g) => ({
        id: g.id,
        label: g.name,
        count: g.tabs.length,
      }))
    );
  }, [tags]);

  // Sites for "Grouped by Site"
  const groupedBySite = useGroupedBySite(tags);
  const sidebarSites: SiteSidebarItem[] = useMemo(
    () =>
      groupedBySite.map((g) => ({
        domain: g.domain,
        count: g.totalCount,
        favIconUrl: g.favIconUrl,
      })),
    [groupedBySite]
  );

  // Most visited + rank tiers
  const mostVisited = useMostVisited(tags);
  const ranks: RankSidebarItem[] = useMemo(() => {
    const total = mostVisited.length;
    if (total === 0) return [];
    const tiers: RankSidebarItem[] = [];
    if (total > 0) tiers.push({ id: 'top-10', label: 'Top 10', range: [0, 10], count: Math.min(total, 10) });
    if (total > 10) tiers.push({ id: 'top-25', label: 'Top 11–25', range: [10, 25], count: Math.min(total - 10, 15) });
    if (total > 25) tiers.push({ id: 'top-50', label: 'Top 26–50', range: [25, 50], count: Math.min(total - 25, 25) });
    if (total > 50) tiers.push({ id: 'rest', label: '50+', range: [50, total], count: total - 50 });
    return tiers;
  }, [mostVisited]);

  // --- Filtered content per view ---

  // Complete list: filter by session
  const completeListTabs = useMemo(() => {
    if (!tags) return [];
    if (selectedSessionId === null) return allTabs;
    for (const tag of tags) {
      const group = tag.groups.find((g) => g.id === selectedSessionId);
      if (group) return group.tabs;
    }
    return [];
  }, [tags, allTabs, selectedSessionId]);

  // Grouped by site: filter by domain
  const filteredGroupedBySite = useMemo(() => {
    if (selectedSite === null) return groupedBySite;
    return groupedBySite.filter((g) => g.domain === selectedSite);
  }, [groupedBySite, selectedSite]);

  // Most visited: filter by rank tier
  const filteredMostVisited = useMemo(() => {
    if (selectedRank === null) return mostVisited;
    const rank = ranks.find((r) => r.id === selectedRank);
    if (!rank) return mostVisited;
    return mostVisited.slice(rank.range[0], rank.range[1]);
  }, [mostVisited, selectedRank, ranks]);

  const displayLimit = settings?.displayLimit ?? 50;

  // Apply display limit to views
  const limitedCompleteListTabs = useMemo(
    () => completeListTabs.slice(0, displayLimit),
    [completeListTabs, displayLimit]
  );

  const limitedMostVisited = useMemo(
    () => filteredMostVisited.slice(0, displayLimit),
    [filteredMostVisited, displayLimit]
  );

  // The tabs shown in the current view (for header count and select all)
  const displayTabs = useMemo(() => {
    switch (activeView) {
      case 'complete-list':
        return limitedCompleteListTabs;
      case 'grouped-by-site':
        return filteredGroupedBySite.flatMap((g) => g.tabs).slice(0, displayLimit);
      case 'most-visited':
        return []; // most visited shows MostVisitedItem, not TabItem
    }
  }, [activeView, limitedCompleteListTabs, filteredGroupedBySite, displayLimit]);

  // Bookmark check for visible tabs
  const visibleUrls = useMemo(() => completeListTabs.slice(0, 50).map((t) => t.url), [completeListTabs]);
  const bookmarkStatus = useBookmarkCheck(visibleUrls);

  // Current title based on sidebar selection
  const currentTitle = useMemo(() => {
    switch (activeView) {
      case 'complete-list':
        if (selectedSessionId) {
          const session = sessions.find((s) => s.id === selectedSessionId);
          return session?.label ?? t('dashboard:completeList');
        }
        return t('dashboard:completeList');
      case 'grouped-by-site':
        return selectedSite ?? t('dashboard:groupedBySite');
      case 'most-visited':
        if (selectedRank) {
          const rank = ranks.find((r) => r.id === selectedRank);
          return rank?.label ?? t('dashboard:mostVisited');
        }
        return t('dashboard:mostVisited');
    }
  }, [activeView, selectedSessionId, selectedSite, selectedRank, sessions, ranks, t]);

  // Reset sidebar selection when switching views
  const handleChangeView = useCallback(
    (view: DashboardView) => {
      setActiveView(view);
      deselectAll();
    },
    [deselectAll]
  );

  const handleOpenTab = useCallback((url: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  }, []);

  const handleDeleteTab = useCallback(
    async (tabId: string) => {
      if (!tags) return;
      const updated = tags.map((tag) => ({
        ...tag,
        groups: tag.groups.map((group) => ({
          ...group,
          tabs: group.tabs.filter((tab) => tab.id !== tabId),
        })),
      }));
      await tagListStorage.setValue(updated);
    },
    [tags]
  );

  const handleEditTab = useCallback((tab: TabItem) => {
    setEditingTab(tab);
    setEditDialogOpen(true);
  }, []);

  const handleSaveEdit = useCallback(
    async (tabId: string, title: string, url: string) => {
      if (!tags) return;
      const updated = tags.map((tag) => ({
        ...tag,
        groups: tag.groups.map((group) => ({
          ...group,
          tabs: group.tabs.map((tab) =>
            tab.id === tabId
              ? { ...tab, title, url, updatedAt: new Date().toISOString() }
              : tab
          ),
        })),
      }));
      await tagListStorage.setValue(updated);
    },
    [tags]
  );

  const handleDeleteSelected = useCallback(async () => {
    if (!tags) return;
    const updated = tags.map((tag) => ({
      ...tag,
      groups: tag.groups.map((group) => ({
        ...group,
        tabs: group.tabs.filter((tab) => !selectedIds.has(tab.id)),
      })),
    }));
    await tagListStorage.setValue(updated);
    deselectAll();
  }, [tags, selectedIds, deselectAll]);

  const handleOpenSelected = useCallback(() => {
    const tabsToOpen = displayTabs.filter((t) => selectedIds.has(t.id));
    tabsToOpen.forEach((tab) => handleOpenTab(tab.url));
  }, [displayTabs, selectedIds, handleOpenTab]);

  const handleUpdateSettings = useCallback(
    async (patch: Partial<SettingsProps>) => {
      if (!settings) return;
      await settingsStorage.setValue({ ...settings, ...patch });
    },
    [settings]
  );

  const handleToggleSelectAll = useCallback(() => {
    const allIds = displayTabs.map((t) => t.id);
    if (isAllSelected(allIds)) {
      deselectAll();
    } else {
      selectAll(allIds);
    }
  }, [displayTabs, isAllSelected, deselectAll, selectAll]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        activeView={activeView}
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        onSelectSession={(id) => { setSelectedSessionId(id); deselectAll(); }}
        sites={sidebarSites}
        selectedSite={selectedSite}
        onSelectSite={(domain) => { setSelectedSite(domain); deselectAll(); }}
        ranks={ranks}
        selectedRank={selectedRank}
        onSelectRank={(id) => { setSelectedRank(id); deselectAll(); }}
        collapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        showFavicons={settings?.showFavicons ?? false}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <ContentHeader
          title={currentTitle}
          tabCount={activeView === 'most-visited' ? limitedMostVisited.length : displayTabs.length}
          totalCount={
            activeView === 'most-visited'
              ? filteredMostVisited.length
              : activeView === 'complete-list'
              ? completeListTabs.length
              : filteredGroupedBySite.flatMap((g) => g.tabs).length
          }
          selectedCount={selectedIds.size}
          allSelected={displayTabs.length > 0 && isAllSelected(displayTabs.map((t) => t.id))}
          onToggleSelectAll={handleToggleSelectAll}
          onDeleteSelected={handleDeleteSelected}
          onOpenSelected={handleOpenSelected}
          showSelection={activeView === 'complete-list'}
        />

        <DashboardTabs activeView={activeView} onChangeView={handleChangeView} />

        <div className="flex-1 overflow-hidden">
          {activeView === 'most-visited' && (
            <MostVisitedView items={limitedMostVisited} showFavicons={settings?.showFavicons ?? false} onOpen={handleOpenTab} />
          )}
          {activeView === 'grouped-by-site' && (
            <GroupedBySiteView groups={filteredGroupedBySite} showFavicons={settings?.showFavicons ?? false} onOpen={handleOpenTab} />
          )}
          {activeView === 'complete-list' && (
            <CompleteListView
              tabs={limitedCompleteListTabs}
              selectedIds={selectedIds}
              bookmarkStatus={bookmarkStatus}
              showFavicons={settings?.showFavicons ?? false}
              onToggleSelect={toggle}
              onDelete={handleDeleteTab}
              onEdit={handleEditTab}
              onOpen={handleOpenTab}
            />
          )}
        </div>
      </div>

      <TabEditDialog
        tab={editingTab}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingTab(null);
        }}
        onSave={handleSaveEdit}
      />

      {settings && (
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}
    </div>
  );
}
