import { useState } from 'react';
import { Globe } from 'lucide-react';

interface FaviconImageProps {
  url: string;
  favIconUrl?: string;
  className?: string;
  useOriginal?: boolean;
}

export function FaviconImage({ url, favIconUrl, className = 'h-4 w-4', useOriginal = true }: FaviconImageProps) {
  const [error, setError] = useState(false);

  if (!useOriginal) {
    return <Globe className={className + ' text-muted-foreground'} />;
  }

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
