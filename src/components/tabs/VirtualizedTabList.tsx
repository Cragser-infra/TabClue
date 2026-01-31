import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TabCard } from './TabCard';
import type { TabItem } from '@/types/tab';

interface VirtualizedTabListProps {
  items: TabItem[];
  selectedIds: Set<string>;
  bookmarkStatus: Map<string, boolean>;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (tab: TabItem) => void;
  onOpen: (url: string) => void;
}

export function VirtualizedTabList({
  items,
  selectedIds,
  bookmarkStatus,
  onToggleSelect,
  onDelete,
  onEdit,
  onOpen,
}: VirtualizedTabListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const tab = items[virtualItem.index];
          return (
            <div
              key={tab.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TabCard
                tab={tab}
                isSelected={selectedIds.has(tab.id)}
                isBookmarked={bookmarkStatus.get(tab.url)}
                onToggleSelect={() => onToggleSelect(tab.id)}
                onDelete={() => onDelete(tab.id)}
                onEdit={() => onEdit(tab)}
                onOpen={() => onOpen(tab.url)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
