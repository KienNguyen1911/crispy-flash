"use client";

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

type ParsedRow = string[];
type ColumnMapping = {
  [key: number]: "word" | "pronunciation" | "meaning" | "part_of_speech" | "skip";
};

interface VocabularyPreviewTableProps {
  parsedData: ParsedRow[];
  columnMapping: ColumnMapping;
  onColumnMapChange: (columnIndex: number, value: "word" | "pronunciation" | "meaning" | "part_of_speech" | "skip") => void;
}

export function VocabularyPreviewTable({
  parsedData,
  columnMapping,
  onColumnMapChange
}: VocabularyPreviewTableProps) {
  const maxColumns =
    parsedData.length > 0
      ? Math.max(...parsedData.map((row) => row.length))
      : 0;
  const columnOptions = ["word", "pronunciation", "meaning", "part_of_speech", "skip"];

  if (parsedData.length === 0) {
    return (
      <p className="text-sm md:text-base text-muted-foreground text-center pb-4">
        No data to preview.
      </p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: maxColumns }).map((_, index) => (
              <TableHead key={index}>
                <Select
                  value={columnMapping[index]}
                  onValueChange={(value: any) =>
                    onColumnMapChange(index, value)
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
                        {opt === "part_of_speech" ? "part of speech" : opt.replace("_", " ")}
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
              {Array.from({ length: maxColumns }).map((_, cellIndex) => (
                <TableCell key={cellIndex}>{row[cellIndex] || ""}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {parsedData.length > 5 && (
        <p className="text-sm md:text-base text-muted-foreground text-center">
          ... and {parsedData.length - 5} more rows.
        </p>
      )}
    </>
  );
}
