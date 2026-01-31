# Phase 2: Duplicate Detection

## Feature
When user visits a site that exists multiple times in saved tabs,
offer to clean up duplicates.

## Approach
- Content script detects current page URL
- Checks storage for matching URLs
- If count > 1: shows a subtle notification/badge
- Clicking it opens a dialog showing all saved instances
- User can choose which to keep

## Considerations
- Performance: must not slow down browsing
- Non-intrusive: small badge, not a popup
- User control: can disable this feature in settings
