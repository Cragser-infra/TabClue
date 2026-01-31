# Dashboard Views Specification

## Three Tabs
1. Most Visited
2. Grouped by Site
3. Complete List

## Most Visited
- Aggregates ALL saved tabs across all tags/groups
- Counts URL occurrences
- Sorted by count descending
- Shows: favicon, title, URL, visit count badge
- Clicking opens the URL

## Grouped by Site
- Groups ALL saved tabs by domain
- Sorted by tab count per domain descending
- Each domain section is collapsible
- Shows domain favicon, domain name, tab count
- Within each domain: individual tabs sorted by savedAt

## Complete List
- Shows tabs for the currently selected tag/group from sidebar
- Virtualized rendering for thousands of tabs
- Each tab: favicon, title, URL, savedAt timestamp, actions
- Actions: edit, delete, open, bookmark indicator
- Lazy loaded - default view when opening dashboard
