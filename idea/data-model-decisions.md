# Data Model Decisions

## Three-level hierarchy: Tag > Group > Tab
Follows NiceTab's proven pattern. Tags are like folders, Groups are
like save sessions, Tabs are individual pages.

## domain stored at save time
We extract and store the domain when saving rather than computing it
on read. This avoids repeated URL parsing and enables efficient
grouping/filtering.

## Staging Area as default system tag
Every new save goes to "Staging Area" by default. Users can create
custom tags and move groups between them. The staging area cannot be
deleted.

## Computed views (not stored)
Most Visited and Grouped by Site views are computed from the stored
data at read time and memoized. This avoids data duplication and
keeps the storage schema simple.

## Flat tab array per group
Tabs within a group are stored as a flat array, not nested.
Ordering is maintained by array index. This simplifies CRUD
operations and virtual scrolling.
