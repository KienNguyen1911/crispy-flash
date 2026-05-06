"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import VocabGraphViewer from "@/components/graph/VocabGraphViewer";

interface DataTableGraphDialogProps<TData> {
  isOpen: boolean;
  data: TData[];
  onOpenChange: (open: boolean) => void;
}

export function DataTableGraphDialog<TData>({
  isOpen,
  data,
  onOpenChange
}: DataTableGraphDialogProps<TData>) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 border-none overflow-hidden [&>button]:z-[60] [&>button]:bg-white [&>button]:text-black [&>button]:border-[3px] [&>button]:border-black [&>button]:shadow-[2px_2px_0px_black] [&>button]:opacity-100 [&>button:hover]:bg-zinc-100 bg-zinc-50">
        <DialogTitle className="sr-only">Whiteboard Graph View</DialogTitle>
        <VocabGraphViewer vocabulary={data as any[]} />
      </DialogContent>
    </Dialog>
  );
}
