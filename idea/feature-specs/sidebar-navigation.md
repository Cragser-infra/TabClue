# Sidebar Navigation Specification

## Layout
VSCode-like left sidebar using shadcn Sidebar component.
Collapsible to icon-only mode.

## Structure
- Header: TabClue logo + search input
- Content: Tag tree
  - Each tag is a collapsible section
  - Within each tag: list of groups
  - Each group shows name + tab count badge
  - Clicking a group selects it → content area shows its tabs
- Footer: Language switcher + settings link

## Search
- Filters tags and groups by name
- Debounced input (300ms)
- Highlights matching text

## Interactions
- Click tag header: collapse/expand
- Click group: select, show in content area
- Right-click tag: rename, delete (if not system)
- Right-click group: rename, delete, lock/unlock
- Collapse all / Expand all buttons
