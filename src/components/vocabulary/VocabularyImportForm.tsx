"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface VocabularyImportFormProps {
  text: string;
  onTextChange: (text: string) => void;
  onPreview: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasData: boolean;
}

export function VocabularyImportForm({
  text,
  onTextChange,
  onPreview,
  onSave,
  isSaving,
  hasData
}: VocabularyImportFormProps) {
  return (
    <>
      <Textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        rows={10}
        placeholder={
          "日  にち / ひ  Ngày, mặt trời  noun\n月  つき / がつ  Mặt trăng, tháng  noun"
        }
        className="mb-4 mt-4"
      />
      <div className="flex justify-between">
        <Button onClick={onPreview}>Preview Data</Button>
        <Button onClick={onSave} disabled={!hasData || isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save Vocabulary"}
        </Button>
      </div>
    </>
  );
}
