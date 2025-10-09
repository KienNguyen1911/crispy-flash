"use client";

import { useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { VocabularyContext } from "@/context/VocabularyContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Vocabulary } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";

type ParsedRow = string[];
type ColumnMapping = {
  [key: number]: "kanji" | "kana" | "meaning" | "skip";
};

export default function VocabularyImportClient() {
  const [text, setText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const router = useRouter();
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
        if (index === 0) newMapping[index] = "kanji";
        else if (index === 1) newMapping[index] = "kana";
        else if (index === 2) newMapping[index] = "meaning";
        else newMapping[index] = "skip";
      });
      setColumnMapping(newMapping);
    }
  };

  /**
   * Parse the raw input text into rows of cells.
   * Supports:
   * - Tab or slash separated (format 1 & 2)
   * - Markdown table (format 3)
   */
  const parseInputToRows = (raw: string): ParsedRow[] => {
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Detect markdown table (lines starting and ending with | or containing | separators)
    const isMarkdownTable = lines.every(
      (line) => line.startsWith("|") && line.includes("|")
    );
    if (isMarkdownTable) {
      // remove separator lines like | --- | --- |
      const filtered = lines.filter(
        (l) => !/^\|?\s*-{1,}\s*(\|\s*-{1,}\s*)+$/i.test(l)
      );
      return filtered
        .map((line) => {
          return line
            .split("|")
            .map((c) => c.trim())
            .filter(
              (c, i) =>
                c !== "" || (i !== 0 && i !== line.split("|").length - 1)
            ); // drop empty leading/trailing
        })
        .map((cells) => cells.filter((cell) => cell !== ""));
    }

    // Otherwise, try splitting by tab first, then slashes, then multiple spaces
    const rows: ParsedRow[] = [];
    for (const line of lines) {
      // If line contains tabs, split by tab
      if (line.includes("\t")) {
        rows.push(
          line
            .split("\t")
            .map((s) => s.trim())
            .filter((s) => s !== "")
        );
        continue;
      }

      // If line contains pipe-separated but not starting with | (some authors omit outer pipes)
      if (line.includes("|")) {
        const cells = line
          .split("|")
          .map((s) => s.trim())
          .filter((s) => s !== "");
        if (cells.length > 1) {
          rows.push(cells);
          continue;
        }
      }

      // If line contains slash separators like 'にち / ひ' or uses tabs and slashes, split on slash or multiple spaces
      if (line.includes("/")) {
        const parts = line
          .split("/")
          .map((s) => s.trim())
          .filter((s) => s !== "");
        // Also split the first segment by tab or spaces to separate kanji and kana if needed
        if (parts.length >= 2) {
          // Try breaking first part by whitespace to get kanji and kana when line like "夕\tゆう / せき\tBuổi chiều"
          const preParts = parts[0]
            .split(/\s+/)
            .map((s) => s.trim())
            .filter((s) => s !== "");
          if (preParts.length > 1) {
            rows.push([
              preParts[0],
              preParts.slice(1).join(" "),
              ...parts.slice(1)
            ]);
          } else {
            rows.push(parts);
          }
          continue;
        }
      }

      // Fallback: split by two-or-more spaces or single tab or single space
      const byTwoSpaces = line
        .split(/\s{2,}/)
        .map((s) => s.trim())
        .filter((s) => s !== "");
      if (byTwoSpaces.length > 1) {
        rows.push(byTwoSpaces);
        continue;
      }

      const bySpace = line
        .split(/\s+/)
        .map((s) => s.trim())
        .filter((s) => s !== "");
      rows.push(bySpace);
    }

    return rows;
  };

  const handleColumnMapChange = (
    columnIndex: number,
    value: "kanji" | "kana" | "meaning" | "skip"
  ) => {
    setColumnMapping((prev) => ({ ...prev, [columnIndex]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const kanjiIndex = Object.keys(columnMapping).find(
      (key) => columnMapping[Number(key)] === "kanji"
    );
    const kanaIndex = Object.keys(columnMapping).find(
      (key) => columnMapping[Number(key)] === "kana"
    );
    const meaningIndex = Object.keys(columnMapping).find(
      (key) => columnMapping[Number(key)] === "meaning"
    );

    if (
      kanjiIndex === undefined ||
      kanaIndex === undefined ||
      meaningIndex === undefined
    ) {
      toast({
        title: "Mapping Error",
        description:
          "Please map 'Kanji', 'Kana', and 'Meaning' columns before saving.",
        variant: "destructive"
      });
      setIsSaving(false);
      return;
    }

    // Prepare basic vocab data
    const vocabToSave: Omit<Vocabulary, "id" | "topicId" | "status">[] =
      parsedData
        .map((row) => ({
          kanji: row[Number(kanjiIndex)],
          kana: row[Number(kanaIndex)],
          meaning: row[Number(meaningIndex)]
        }))
        .filter((item) => item.kanji && item.kana && item.meaning);

    console.log(`Prepared ${vocabToSave.length} vocabulary items for saving`);
    addVocabulary(topicId, vocabToSave);
    setIsSaving(false);
    router.push(`/projects/${projectId}/topics/${topicId}`);
  };

  const maxColumns =
    parsedData.length > 0
      ? Math.max(...parsedData.map((row) => row.length))
      : 0;
  const columnOptions = ["kanji", "kana", "meaning", "skip"];

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Import Vocabulary</CardTitle>
          <CardDescription>
            Paste your vocabulary data below. Common formats are Kanji / Kana /
            Meaning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder={
              "日  にち / ひ  Ngày, mặт trời\n月  つき / がつ  Mặт trăng, tháng"
            }
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handlePreview}>Preview Data</Button>
          <Button
            onClick={handleSave}
            disabled={parsedData.length === 0 || isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Vocabulary"}
          </Button>
        </CardFooter>
      </Card>

      {/* Separator */}
      <div className="mt-4"></div>

      {showPreview && (
        <div className="rounded-md border space-y-4">
          {parsedData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center pb-4">No data to preview.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {Array.from({ length: maxColumns }).map((_, index) => (
                      <TableHead key={index}>
                        <Select
                          value={columnMapping[index]}
                          onValueChange={(value: any) =>
                            handleColumnMapChange(index, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Map Column" />
                          </SelectTrigger>
                          <SelectContent>
                            {columnOptions.map((opt) => (
                              <SelectItem
                                key={opt}
                                value={opt}
                                className="capitalize"
                              >
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: maxColumns }).map(
                        (_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {row[cellIndex] || ""}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {parsedData.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... and {parsedData.length - 5} more rows.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
