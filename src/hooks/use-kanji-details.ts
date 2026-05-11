import { useState, useEffect } from "react";
import { KanjiDetails, fetchKanjiDetails } from "@/services/kanji-api";

const cache: Record<string, KanjiDetails | null> = {};

export function useKanjiDetails(kanji: string | null, isOpen: boolean) {
  const [data, setData] = useState<KanjiDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!kanji || !isOpen) {
      if (!isOpen) setData(null);
      return;
    }

    if (cache[kanji] !== undefined) {
      setData(cache[kanji]);
      return;
    }

    let isMounted = true;
    const fetch = async () => {
      setIsLoading(true);
      const result = await fetchKanjiDetails(kanji);
      
      if (isMounted) {
        cache[kanji] = result;
        setData(result);
        setIsLoading(false);
      }
    };

    fetch();

    return () => {
      isMounted = false;
    };
  }, [kanji, isOpen]);

  return { data, isLoading };
}
