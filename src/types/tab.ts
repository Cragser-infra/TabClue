export interface TabItem {
  id: string;
  title: string;
  url: string;
  favIconUrl?: string;
  domain: string;
  savedAt: string;
  updatedAt?: string;
}

export interface GroupItem {
  id: string;
  name: string;
  createdAt: string;
  tabs: TabItem[];
  isLocked: boolean;
}

export interface TagItem {
  id: string;
  name: string;
  createdAt: string;
  groups: GroupItem[];
  isSystem: boolean;
  isLocked: boolean;
  isCollapsed: boolean;
}

export interface MostVisitedItem {
  url: string;
  title: string;
  domain: string;
  favIconUrl?: string;
  count: number;
  lastSavedAt: string;
}

export interface DomainGroup {
  domain: string;
  favIconUrl?: string;
  tabs: TabItem[];
  totalCount: number;
}

export interface CountInfo {
  tagCount: number;
  groupCount: number;
  tabCount: number;
}
