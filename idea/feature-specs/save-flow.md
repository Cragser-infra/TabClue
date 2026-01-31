# Save Flow Specification

## Trigger
- Click extension icon (opens popup with save button)
- Keyboard shortcut: Alt+Shift+S

## Flow
1. User clicks "Save All Tabs" in popup
2. Popup sends SAVE_ALL_TABS message to background
3. Background queries chrome.tabs for current window
4. Filters out chrome://, chrome-extension://, about: URLs
5. Creates TabItem[] with id, title, url, favicon, domain, savedAt
6. Creates GroupItem with auto-generated name "Session YYYY-MM-DD HH:MM"
7. Reads current tagList from storage
8. Prepends new group to default tag ("Staging Area")
9. Writes updated tagList to storage
10. Returns savedCount and tabIds to popup
11. Popup shows confirmation: "X tabs saved. Close them?"
12. If user clicks "Close": sends CLOSE_SAVED_TABS to background
13. Background calls chrome.tabs.remove() (excluding extension pages)
14. If user clicks "Keep open": dialog dismisses, tabs stay open

## Edge Cases
- No savable tabs: show message, no group created
- Extension pages: always excluded from save and close
- Duplicate URLs in same session: saved as-is (dedup is Phase 2)
