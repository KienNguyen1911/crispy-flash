"use client";

import { useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { VocabularyContext } from "@/context/VocabularyContext";
import { useToast } from "@/hooks/use-toast";
import type { Vocabulary } from "@/lib/types";
import { parseInputToRows } from "@/lib/vocabulary-parser";
import { VocabularyImportForm } from "./VocabularyImportForm";
import { VocabularyPreviewTable } from "./VocabularyPreviewTable";

type ParsedRow = string[];
type ColumnMapping = {
  [key: number]: "word" | "pronunciation" | "meaning" | "part_of_speech" | "skip";
};

export default function VocabularyImportClient() {
  const { push } = useRouter();
  const [text, setText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const params = useParams();
  const projectId = params.projectId as string;
  const topicId = params.topicId as string;

  const { addVocabulary } = useContext(VocabularyContext);
  const { toast } = useToast();

  const handlePreview = () => {
    const data = parseInputToRows(text);
    setParsedData(data);
    setShowPreview(true);

    // Auto-map based on common patterns
    if (data.length > 0) {
      const firstRow = data[0];
      const newMapping: ColumnMapping = {};
      firstRow.forEach((_, index) => {
        if (index === 0) newMapping[index] = "word";
        else if (index === 1) newMapping[index] = "pronunciation";
        else if (index === 2) newMapping[index] = "meaning";
        else if (index === 3) newMapping[index] = "part_of_speech";
        else newMapping[index] = "skip";
      });
      setColumnMapping(newMapping);
    }
  };

  const handleColumnMapChange = (
    columnIndex: number,
    value: "word" | "pronunciation" | "meaning" | "part_of_speech" | "skip"
  ) => {
    setColumnMapping((prev) => ({ ...prev, [columnIndex]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Build index map in single pass
    const indexMap = Object.entries(columnMapping).reduce<Record<string, string | undefined>>((acc, [key, val]) => {
      acc[val] = key;
      return acc;
    }, {});
    
    const wordIndex = indexMap["word"];
    const pronunciationIndex = indexMap["pronunciation"];
    const meaningIndex = indexMap["meaning"];
    const partOfSpeechIndex = indexMap["part_of_speech"];

    if (
      wordIndex === undefined ||
      pronunciationIndex === undefined ||
      meaningIndex === undefined
    ) {
      toast({
        title: "Mapping Error",
        description:
          "Please map 'Word', 'Pronunciation', and 'Meaning' columns before saving.",
        variant: "destructive"
      });
      setIsSaving(false);
      return;
    }

    // Prepare basic vocab data
    const vocabToSave: Omit<Vocabulary, "id" | "topicId" | "status">[] =
      parsedData.reduce<Omit<Vocabulary, "id" | "topicId" | "status">[]>((acc, row) => {
        const item = {
          word: row[Number(wordIndex)],
          pronunciation: row[Number(pronunciationIndex)],
          meaning: row[Number(meaningIndex)],
          part_of_speech: partOfSpeechIndex ? row[Number(partOfSpeechIndex)] : undefined
        };
        if (item.word && item.pronunciation && item.meaning) {
          acc.push(item);
        }
        return acc;
      }, []);

    console.log(`Prepared ${vocabToSave.length} vocabulary items for saving`);
    addVocabulary(topicId, vocabToSave);
    setIsSaving(false);
    push(`/projects/${projectId}/topics/${topicId}`);
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Import Vocabulary</CardTitle>
          <CardDescription>
            Paste your vocabulary data below. Common formats are Word / Pronunciation /
            Meaning / Part of Speech (optional).
          </CardDescription>
        </CardHeader>
      </Card>
      <VocabularyImportForm
        text={text}
        onTextChange={setText}
        onPreview={handlePreview}
        onSave={handleSave}
        isSaving={isSaving}
        hasData={parsedData.length > 0}
      />
      <div className="mt-4"></div>

      {showPreview && (
        <div className="rounded-md border space-y-4">
          <VocabularyPreviewTable
            parsedData={parsedData}
            columnMapping={columnMapping}
            onColumnMapChange={handleColumnMapChange}
          />
        </div>
      )}
    </div>
  );
}