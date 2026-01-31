# Bookmark Indicator Specification

## Purpose
Shows a small icon on each TabCard indicating whether the URL
exists in Chrome bookmarks.

## Implementation
- Uses chrome.bookmarks.search({ url }) API
- Only checks visible items (thanks to virtual scrolling)
- Results cached in component state Map<string, boolean>
- Re-checks when new items scroll into view

## UI
- Small bookmark icon (filled if bookmarked, outline if not)
- Tooltip: "Bookmarked" or "Not bookmarked"
- Position: right side of TabCard, before action buttons

## Performance
- Batch check ~30 URLs at a time (viewport size)
- Cache results for the session
- Don't re-check on every scroll, only on new items
