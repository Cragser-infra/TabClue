import { useState } from 'react';
import { Globe } from 'lucide-react';

interface FaviconImageProps {
  url: string;
  favIconUrl?: string;
  className?: string;
}

export function FaviconImage({ url, favIconUrl, className = 'h-4 w-4' }: FaviconImageProps) {
  const [error, setError] = useState(false);

  const src = (() => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      return `chrome://favicon2/?size=16&page_url=${encodeURIComponent(url)}`;
    }
    return favIconUrl || '';
  })();

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
