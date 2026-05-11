import { Vocabulary } from "@/lib/types";

export interface KanjiExample {
  japanese: string;
  reading: string;
  meaning: string;
}

export interface Radical {
  radical: string;
  hanviet?: string;
}

export interface KanjiDetails {
  kanji: string;
  meaning: string;
  hanviet?: string;
  onyomi: string;
  kunyomi: string;
  hint?: string;
  radicals: Radical[];
  examples: {
    vn: { word: string; kana: string; mean: string }[];
    en: { japanese: string; reading: string; english: string }[];
  };
}

export async function fetchKanjiDetails(kanji: string): Promise<KanjiDetails | null> {
  try {
    const [kanjiAliveRes, jdictRes] = await Promise.allSettled([
      fetch(`/api/kanjialive/${kanji}`),
      fetch(`https://api.jdict.net/api/v1/kanjis/${kanji}`)
    ]);

    let kanjiAliveData: any = null;
    let jdictData: any = null;

    if (kanjiAliveRes.status === "fulfilled" && kanjiAliveRes.value.ok) {
      const data = await kanjiAliveRes.value.json();
      if (data && data.length !== 0) {
        // Normalize kanjiAlive examples
        if (data.examples) {
          data.examples.forEach((ex: any) => {
            // "展覧会（てんらんかい）" -> "てんらんかい"
            ex.reading = (ex.japanese.match(/（(.*?)）/) || [])[1] || "";
            // "展覧会（てんらんかい）" -> "展覧会"
            ex.japanese = ex.japanese.replace(/（.*?）/g, "");
          });
        }
        kanjiAliveData = data;
      }
    }

    if (jdictRes.status === "fulfilled" && jdictRes.value.ok) {
      jdictData = await jdictRes.value.json();
    }

    if (!kanjiAliveData && !jdictData) return null;

    // Normalize and merge data
    return {
      kanji,
      meaning: kanjiAliveData?.meaning || jdictData?.mean || "—",
      hanviet: jdictData?.hanviet,
      onyomi: kanjiAliveData?.onyomi_ja || jdictData?.onyomi || "—",
      kunyomi: kanjiAliveData?.kunyomi_ja || jdictData?.kunyomi || "—",
      hint: kanjiAliveData?.hint,
      radicals: jdictData?.radicals || [],
      examples: {
        vn: jdictData?.related_words?.map((ex: any) => ({
          word: ex.word.replace("する", " する"),
          kana: ex.kana,
          mean: ex.mean
        })) || [],
        en: kanjiAliveData?.examples?.map((ex: any) => ({
          japanese: ex.japanese,
          reading: ex.reading,
          english: ex.english
        })) || []
      }
    };
  } catch (error) {
    console.error(`Failed to fetch details for kanji: ${kanji}`, error);
    return null;
  }
}
