# Tech Stack Decisions

## WXT over raw Manifest V3
WXT abstracts browser extension boilerplate, provides HMR, auto-imports,
storage utilities, and handles manifest generation.

## Shadcn/UI over Ant Design
- Smaller bundle (only install what you use)
- Tailwind CSS integration (no CSS-in-JS runtime)
- More control over component styling
- Modern, clean aesthetic

## react-i18next over react-intl
- More popular and widely maintained
- Namespace-based translations (load per page)
- Type-safe keys with module augmentation
- Simpler API with useTranslation hook

## @tanstack/react-virtual over react-virtuoso
- Lighter weight, fewer dependencies
- More flexible (works with any scroll container)
- Better maintained in the TanStack ecosystem

## nanoid over UUID
- Shorter IDs (12 chars vs 36)
- Faster generation
- URL-safe characters
- Sufficient entropy for local storage

## chrome.storage.local over IndexedDB
- Simpler API, works across extension contexts
- WXT provides reactive watchers
- unlimitedStorage permission removes 10MB cap
- Automatic JSON serialization
