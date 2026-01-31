import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { BarChart3, Globe, List } from 'lucide-react';

export type DashboardView = 'most-visited' | 'grouped-by-site' | 'complete-list';

interface DashboardTabsProps {
  activeView: DashboardView;
  onChangeView: (view: DashboardView) => void;
}

const views: { id: DashboardView; labelKey: string; icon: React.ElementType }[] = [
  { id: 'most-visited', labelKey: 'dashboard:mostVisited', icon: BarChart3 },
  { id: 'grouped-by-site', labelKey: 'dashboard:groupedBySite', icon: Globe },
  { id: 'complete-list', labelKey: 'dashboard:completeList', icon: List },
];

export function DashboardTabs({ activeView, onChangeView }: DashboardTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex border-b">
      {views.map(({ id, labelKey, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChangeView(id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
            activeView === id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          )}
        >
          <Icon className="h-4 w-4" />
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}
