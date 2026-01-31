# NiceTab Analysis

Reference: https://github.com/web-dahuyou/NiceTab

## Tech Stack
- React 18 + TypeScript + Ant Design + WXT framework
- styled-components for CSS-in-JS
- react-intl for i18n (Chinese + English)
- react-virtuoso for virtual scrolling
- @atlaskit/pragmatic-drag-and-drop for DnD
- webdav + GitHub Gists for sync

## Data Model
Three-level hierarchy: Tag > Group > Tab
- Tags: top-level folders (like categories)
- Groups: sessions or collections within a tag
- Tabs: individual saved browser tabs

## Key Features We're Adopting
1. VSCode-like sidebar with tree navigation
2. Collapsible tag/group tree
3. Search/filter in sidebar
4. Tab cards with actions (delete, edit, open)
5. Virtual scrolling for large lists

## What We're Doing Differently
1. Full i18n from day 1 (not just CN/EN)
2. Shadcn/UI instead of Ant Design (lighter, more customizable)
3. Bookmark indicator (shows if tab is bookmarked)
4. Three dashboard views: Most Visited, Grouped by Site, Complete List
5. Simpler data model for Phase 1

## Architecture Patterns Worth Noting
- WXT storage.defineItem with watchers for reactive updates
- Background service worker as coordinator
- Cross-context sync via storage.watch()
- Debounced writes for performance
