import { useState } from 'react';
import { Globe } from 'lucide-react';

interface FaviconImageProps {
  url: string;
  favIconUrl?: string;
  className?: string;
  useOriginal?: boolean;
}

function getFaviconUrl(pageUrl: string, favIconUrl?: string): string {
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    const base = chrome.runtime.getURL('_favicon/');
    return `${base}?pageUrl=${encodeURIComponent(pageUrl)}&size=32`;
  }
  return favIconUrl || '';
}

export function FaviconImage({ url, favIconUrl, className = 'h-4 w-4', useOriginal = true }: FaviconImageProps) {
  const [error, setError] = useState(false);

  if (!useOriginal) {
    return <Globe className={className + ' text-muted-foreground'} />;
  }

  const src = getFaviconUrl(url, favIconUrl);

  if (error || !src) {
    return <Globe className={className + ' text-muted-foreground'} />;
  }

  return (
    <img
      src={src}
      alt=""
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
