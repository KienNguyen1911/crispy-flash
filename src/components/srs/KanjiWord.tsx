"use client";

interface KanjiWordProps {
  word: string;
  onKanjiClick: (word: string, kanji: string) => void;
}

export function KanjiWord({ word, onKanjiClick }: KanjiWordProps) {
  const chars = word.split("");
  const kanjis = word.match(/[\u4e00-\u9faf]/g);

  if (!kanjis || kanjis.length === 0) {
    return <span>{word}</span>;
  }

  return (
    <span>
      {chars.map((char) => {
        if (/[\u4e00-\u9faf]/.test(char)) {
          return (
            <span
              key={`${word}-${char}-kanji`}
              className="cursor-pointer hover:text-blue-500 hover:scale-110 transition-all inline-block mx-0.5"
              onClick={() => onKanjiClick(word, char)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onKanjiClick(word, char);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {char}
            </span>
          );
        }
        return <span key={`${word}-${char}`}>{char}</span>;
      })}
    </span>
  );
}
