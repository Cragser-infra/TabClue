import { useState, useEffect } from 'react';
import type { WxtStorageItem } from 'wxt/utils/storage';

export function useStorage<T>(storageItem: WxtStorageItem<T, Record<string, unknown>>) {
  const [value, setValue] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storageItem.getValue().then((val) => {
      setValue(val);
      setIsLoading(false);
    });

    const unwatch = storageItem.watch((newValue) => {
      setValue(newValue);
    });

    return () => {
      unwatch();
    };
  }, [storageItem]);

  return { value, isLoading };
}
