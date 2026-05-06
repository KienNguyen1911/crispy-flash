"use client";

import React from "react";
import { Table as TanstackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DataTableTableViewProps<TData> {
  table: TanstackTable<TData>;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  dirtyRowIds: Set<string>;
  isDesktop: boolean;
  columnsLength: number;
  onRowClick: (word: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function DataTableTableView<TData>({
  table,
  isEditing,
  hasUnsavedChanges,
  dirtyRowIds,
  isDesktop,
  columnsLength,
  onRowClick,
  onSave,
  onCancel
}: DataTableTableViewProps<TData>) {
  return (
    <div className="space-y-3">
      {isEditing && (
        <div className="sticky top-4 z-20 rounded-xl border border-amber-500/20 bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Editing vocabulary</span>
              {hasUnsavedChanges ? (
                <Badge
                  variant="outline"
                  className="border-amber-500/50 text-amber-600"
                >
                  Unsaved changes
                </Badge>
              ) : (
                <span>All changes saved locally</span>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={onSave} className="w-full sm:w-auto">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      <Card className="rounded-xl border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden shadow-lg">
        <Table>
          {!isDesktop ? null : (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap px-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          )}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const status = (row.original as any).status;
                const isDirtyRow = dirtyRowIds.has((row.original as any).id);
                let rowClassName = "";
                
                if (!isDesktop) {
                  switch (status) {
                    case "REMEMBERED":
                      rowClassName = "border-l-4 border-emerald-500 bg-emerald-500/5";
                      break;
                    case "NOT_REMEMBERED":
                      rowClassName = "border-l-4 border-rose-500 bg-rose-500/5";
                      break;
                    case "NEW":
                      rowClassName = "border-l-4 border-sky-500 bg-sky-500/5";
                      break;
                    default:
                      rowClassName = "border-l-4 border-slate-500 bg-slate-500/5";
                  }
                }
                
                if (isDirtyRow) {
                  rowClassName = `${rowClassName} bg-amber-500/10 border-amber-500/30`;
                }

                if (!isDesktop) {
                  const wordCell = row.getVisibleCells().find((c) => c.column.id === "word");
                  const pronCell = row.getVisibleCells().find((c) => c.column.id === "pronunciation");
                  const meanCell = row.getVisibleCells().find((c) => c.column.id === "meaning");

                  if (isEditing) {
                    return (
                      <TableRow key={row.id} className={rowClassName}>
                        <TableCell className="p-4 flex flex-col gap-3">
                          {wordCell && flexRender(wordCell.column.columnDef.cell, wordCell.getContext())}
                          {pronCell && flexRender(pronCell.column.columnDef.cell, pronCell.getContext())}
                          {meanCell && flexRender(meanCell.column.columnDef.cell, meanCell.getContext())}
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`${rowClassName} hover:bg-muted/50 transition-colors duration-200 cursor-pointer block w-full`}
                      onClick={() => onRowClick((row.original as any).word)}
                    >
                      <TableCell className="p-4 flex flex-col gap-1 border-b border-border/10 w-full block">
                        <div className="flex justify-between items-start w-full">
                          <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-headline text-2xl font-bold text-primary truncate max-w-full">
                              {(row.original as any).word}
                            </h4>
                            <p className="text-muted-foreground italic text-sm truncate max-w-full">
                              {(row.original as any).pronunciation}
                            </p>
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <p className="text-foreground font-medium text-sm break-words">
                              {(row.original as any).meaning}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`${rowClassName} hover:bg-muted/50 transition-colors duration-200 ${isEditing ? "cursor-default" : "cursor-pointer"}`}
                    onClick={() => onRowClick((row.original as any).word)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`p-4 ${isEditing ? "px-1" : ""}`.trim() || undefined}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columnsLength} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
