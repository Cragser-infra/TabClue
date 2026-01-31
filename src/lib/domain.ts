export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return 'unknown';
  }
}

export function getFaviconUrl(url: string, savedFavIconUrl?: string): string {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return `chrome://favicon2/?size=16&page_url=${encodeURIComponent(url)}`;
  }
  return savedFavIconUrl || '';
}
