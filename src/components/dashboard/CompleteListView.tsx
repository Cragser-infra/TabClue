import { useTranslation } from 'react-i18next';
import { VirtualizedTabList } from '@/components/tabs/VirtualizedTabList';
import type { TabItem } from '@/types/tab';

interface CompleteListViewProps {
  tabs: TabItem[];
  selectedIds: Set<string>;
  bookmarkStatus: Map<string, boolean>;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (tab: TabItem) => void;
  onOpen: (url: string) => void;
}

export function CompleteListView({
  tabs,
  selectedIds,
  bookmarkStatus,
  onToggleSelect,
  onDelete,
  onEdit,
  onOpen,
}: CompleteListViewProps) {
  const { t } = useTranslation('dashboard');

  if (tabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('emptyState')}</p>
      </div>
    );
  }

  return (
    <VirtualizedTabList
      items={tabs}
      selectedIds={selectedIds}
      bookmarkStatus={bookmarkStatus}
      onToggleSelect={onToggleSelect}
      onDelete={onDelete}
      onEdit={onEdit}
      onOpen={onOpen}
    />
  );
}
