import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStorage } from '@/hooks/useStorage';
import { useTabSelection } from '@/hooks/useTabSelection';
import { useMostVisited } from '@/hooks/useMostVisited';
import { useGroupedBySite } from '@/hooks/useGroupedBySite';
import { useBookmarkCheck } from '@/hooks/useBookmarkCheck';
import { tagListStorage } from '@/storage';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ContentHeader } from '@/components/layout/ContentHeader';
import { DashboardTabs, type DashboardView } from '@/components/dashboard/DashboardTabs';
import { MostVisitedView } from '@/components/dashboard/MostVisitedView';
import { GroupedBySiteView } from '@/components/dashboard/GroupedBySiteView';
import { CompleteListView } from '@/components/dashboard/CompleteListView';
import { TabEditDialog } from '@/components/tabs/TabEditDialog';
import type { TagItem, TabItem } from '@/types/tab';

export default function App() {
  const { t } = useTranslation();
  const { value: tags, isLoading } = useStorage(tagListStorage);

  const [activeView, setActiveView] = useState<DashboardView>('complete-list');
  const [selectedTagId, setSelectedTagId] = useState<string | null>('staging-area');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingTab, setEditingTab] = useState<TabItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { selectedIds, toggle, selectAll, deselectAll, isAllSelected } = useTabSelection();

  // Get the currently visible tabs based on selection
  const currentTabs = useMemo(() => {
    if (!tags) return [];
    if (selectedGroupId) {
      for (const tag of tags) {
        const group = tag.groups.find((g) => g.id === selectedGroupId);
        if (group) return group.tabs;
      }
      return [];
    }
    if (selectedTagId) {
      const tag = tags.find((t) => t.id === selectedTagId);
      if (tag) return tag.groups.flatMap((g) => g.tabs);
    }
    return tags.flatMap((tag) => tag.groups.flatMap((g) => g.tabs));
  }, [tags, selectedTagId, selectedGroupId]);

  // All tabs for computed views
  const allTabs = useMemo(
    () => tags?.flatMap((tag) => tag.groups.flatMap((g) => g.tabs)) ?? [],
    [tags]
  );

  const mostVisited = useMostVisited(tags);
  const groupedBySite = useGroupedBySite(tags);

  // Bookmark check for visible tabs
  const visibleUrls = useMemo(() => currentTabs.slice(0, 50).map((t) => t.url), [currentTabs]);
  const bookmarkStatus = useBookmarkCheck(visibleUrls);

  // Current title
  const currentTitle = useMemo(() => {
    if (!tags) return '';
    if (selectedGroupId) {
      for (const tag of tags) {
        const group = tag.groups.find((g) => g.id === selectedGroupId);
        if (group) return group.name;
      }
    }
    if (selectedTagId) {
      const tag = tags.find((t) => t.id === selectedTagId);
      if (tag) return tag.name;
    }
    return t('dashboard:completeList');
  }, [tags, selectedTagId, selectedGroupId, t]);

  const handleToggleCollapse = useCallback(
    async (tagId: string) => {
      if (!tags) return;
      const updated = tags.map((tag) =>
        tag.id === tagId ? { ...tag, isCollapsed: !tag.isCollapsed } : tag
      );
      await tagListStorage.setValue(updated);
    },
    [tags]
  );

  const handleSelectGroup = useCallback((tagId: string, groupId: string) => {
    setSelectedTagId(tagId);
    setSelectedGroupId(groupId);
    setActiveView('complete-list');
    deselectAll();
  }, [deselectAll]);

  const handleSelectTag = useCallback((tagId: string) => {
    setSelectedTagId(tagId);
    setSelectedGroupId(null);
    deselectAll();
  }, [deselectAll]);

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
    const tabsToOpen = currentTabs.filter((t) => selectedIds.has(t.id));
    tabsToOpen.forEach((tab) => handleOpenTab(tab.url));
  }, [currentTabs, selectedIds, handleOpenTab]);

  const handleToggleSelectAll = useCallback(() => {
    const allIds = currentTabs.map((t) => t.id);
    if (isAllSelected(allIds)) {
      deselectAll();
    } else {
      selectAll(allIds);
    }
  }, [currentTabs, isAllSelected, deselectAll, selectAll]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const displayTabs = activeView === 'complete-list' ? currentTabs : allTabs;

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        tags={tags ?? []}
        selectedGroupId={selectedGroupId}
        selectedTagId={selectedTagId}
        onSelectGroup={handleSelectGroup}
        onSelectTag={handleSelectTag}
        onToggleCollapse={handleToggleCollapse}
        collapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <ContentHeader
          title={currentTitle}
          tabCount={displayTabs.length}
          selectedCount={selectedIds.size}
          allSelected={isAllSelected(currentTabs.map((t) => t.id))}
          onToggleSelectAll={handleToggleSelectAll}
          onDeleteSelected={handleDeleteSelected}
          onOpenSelected={handleOpenSelected}
        />

        <DashboardTabs activeView={activeView} onChangeView={setActiveView} />

        <div className="flex-1 overflow-hidden">
          {activeView === 'most-visited' && (
            <MostVisitedView items={mostVisited} onOpen={handleOpenTab} />
          )}
          {activeView === 'grouped-by-site' && (
            <GroupedBySiteView groups={groupedBySite} onOpen={handleOpenTab} />
          )}
          {activeView === 'complete-list' && (
            <CompleteListView
              tabs={currentTabs}
              selectedIds={selectedIds}
              bookmarkStatus={bookmarkStatus}
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
    </div>
  );
}
