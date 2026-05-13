"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";

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

import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";

import {
  Pen,
  Plus,
  Trash2,
  Table as TableIcon,
  Network,
  Command
} from "lucide-react";
import {
  deleteVocabularies,
  updateVocabularies
} from "@/services/topics-vocabularies-api";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { KanjiDrawer } from "@/components/vocabularies/KanjiDrawer";
import VocabGraphViewer from "@/components/graph/VocabGraphViewer";
import { TopicSwitcher } from "@/components/topics/TopicSwitcher";
import { useSearchParams } from "next/navigation";
import { NeoPanel, NeoToolbar } from "@/components/ui/neo";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  projectId: string;
  topicId: string;
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  projectId,
  topicId
}: DataTableProps<TData, TValue>) {
  const searchParams = useSearchParams();
  const initialViewMode = (searchParams.get("viewMode") as "table" | "graph") || "table";
  
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isEditing, setIsEditing] = React.useState(false);
  const [data, setData] = React.useState(initialData);
  const [deletedVocabularyIds, setDeletedVocabularyIds] = React.useState<
    Set<string>
  >(new Set());
  const [viewMode, setViewMode] = React.useState<"table" | "graph">(initialViewMode);
  const [selectedKanjiWord, setSelectedKanjiWord] = React.useState<string | null>(null);
  const [isTopicSwitcherOpen, setIsTopicSwitcherOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Update viewMode if URL param changes
  React.useEffect(() => {
    const mode = searchParams.get("viewMode");
    if (mode === "graph" || mode === "table") {
      setViewMode(mode);
    }
  }, [searchParams]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        if (viewMode === "graph") {
          e.preventDefault();
          setIsTopicSwitcherOpen((open) => !open);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [viewMode]);

  const augmentedColumns = React.useMemo(() => {
    const actionColumn: ColumnDef<TData, TValue> = {
      id: "actions",
      cell: ({ row, table }) => {
        const meta = table.options.meta as any;
        if (!meta.isEditing) {
          return null;
        }
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.deleteRow(row.index)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        );
      }
    };
    return [...columns, actionColumn];
  }, [columns, isEditing]);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    if (isEditing) {
      setSelectedKanjiWord(null);
    }
  }, [isEditing]);

  React.useEffect(() => {
    setColumnVisibility((current) => ({
      ...current,
      status: isDesktop,
      actions: isEditing
    }));
  }, [isDesktop, isEditing]);

  const visibleData = React.useMemo(
    () => data.filter((row) => !deletedVocabularyIds.has((row as any).id)),
    [data, deletedVocabularyIds]
  );

  const hasUnsavedChanges = React.useMemo(() => {
    if (deletedVocabularyIds.size > 0) {
      return true;
    }

    const initialDataById = (initialData as any[]).reduce<Record<string, any>>(
      (acc, row) => {
        acc[row.id] = row;
        return acc;
      },
      {}
    );

    return (data as any[]).some((row) => {
      const originalRow = initialDataById[(row as any).id];
      if (!originalRow) {
        return false;
      }
      return JSON.stringify(row) !== JSON.stringify(originalRow);
    });
  }, [data, deletedVocabularyIds, initialData]);

  const dirtyRowIds = React.useMemo(() => {
    const initialDataById = (initialData as any[]).reduce<Record<string, any>>(
      (acc, row) => {
        acc[row.id] = row;
        return acc;
      },
      {}
    );

    return new Set(
      (data as any[])
        .filter((row) => {
          if (deletedVocabularyIds.has((row as any).id)) {
            return false;
          }

          const originalRow = initialDataById[(row as any).id];
          if (!originalRow) {
            return false;
          }

          return JSON.stringify(row) !== JSON.stringify(originalRow);
        })
        .map((row) => (row as any).id)
    );
  }, [data, deletedVocabularyIds, initialData]);

  const table = useReactTable({
    data: visibleData,
    columns: augmentedColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    },
    meta: {
      isEditing,
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value
              };
            }
            return row;
          })
        );
      },
      deleteRow: (rowIndex: number) => {
        const idToDelete = (visibleData[rowIndex] as any).id;
        setDeletedVocabularyIds((old) => new Set(old).add(idToDelete));
      }
    } as any
  });

  const handleSave = async () => {
    try {
      const initialDataById = (initialData as any[]).reduce((acc, row) => {
        acc[row.id] = row;
        return acc;
      }, {});

      const changedVocabularies = (data as any[]).filter((row) => {
        if (deletedVocabularyIds.has((row as any).id)) return false;
        const originalRow = initialDataById[(row as any).id];
        if (!originalRow) {
          return false;
        }
        return JSON.stringify(row) !== JSON.stringify(originalRow);
      });

      const deletePromise =
        deletedVocabularyIds.size > 0
          ? deleteVocabularies(topicId, Array.from(deletedVocabularyIds))
          : Promise.resolve();

      const updatePromise =
        changedVocabularies.length > 0
          ? updateVocabularies(topicId, changedVocabularies)
          : Promise.resolve();

      await Promise.all([deletePromise, updatePromise]);

      let messages = [];
      if (deletedVocabularyIds.size > 0) {
        messages.push(`${deletedVocabularyIds.size} vocabularies deleted`);
      }
      if (changedVocabularies.length > 0) {
        messages.push(`${changedVocabularies.length} vocabularies updated`);
      }

      if (messages.length > 0) {
        toast.success(messages.join(" and ") + " successfully.");
      } else {
        toast.info("No changes to save.");
      }
    } catch (error) {
      toast.error("Failed to update vocabularies");
    } finally {
      setIsEditing(false);
      setDeletedVocabularyIds(new Set());
    }
  };

  const handleCancel = () => {
    setData(initialData);
    setDeletedVocabularyIds(new Set());
    setIsEditing(false);
  };

  const handleSwitchView = (nextViewMode: "table" | "graph") => {
    setViewMode(nextViewMode);
  };

  const handleRowClick = (word: string) => {
    if (!isEditing) {
      setSelectedKanjiWord(word);
    }
  };

  const filterControls = (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
      <Select
        value={(table.getColumn("status")?.getFilterValue() as string) ?? "ALL"}
        onValueChange={(value) => {
          if (value === "ALL") {
            table.getColumn("status")?.setFilterValue(undefined);
          } else {
            table.getColumn("status")?.setFilterValue(value);
          }
        }}
      >
        <SelectTrigger className="w-full rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-[var(--neo-surface)] font-semibold shadow-[var(--neo-shadow-sm)] sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="REMEMBERED">Memorized</SelectItem>
          <SelectItem value="NOT_REMEMBERED">Struggling</SelectItem>
          <SelectItem value="UNKNOWN">Not started</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const actionButtons = (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      {!isEditing ? (
        <Link href={`/projects/${projectId}/topics/${topicId}/import`}>
          <Button variant="neoSecondary" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Import
          </Button>
        </Link>
      ) : null}
      <div className="flex w-full items-center rounded-[var(--neo-radius)] border-2 border-[var(--neo-line-strong)] bg-black p-1 shadow-[var(--neo-shadow-sm)] sm:w-auto">
        <Button
          variant={viewMode === "table" ? "neo" : "neoGhost"}
          size="sm"
          onClick={() => handleSwitchView("table")}
          title="Table view"
          className="flex-1 sm:flex-none"
        >
          <TableIcon className="mr-2 h-4 w-4" />
          Table
        </Button>
        <Button
          variant={viewMode === "graph" ? "neo" : "neoGhost"}
          size="sm"
          onClick={() => handleSwitchView("graph")}
          title="Graph view"
          className="flex-1 sm:flex-none"
        >
          <Network className="mr-2 h-4 w-4" />
          Graph
        </Button>
      </div>
      {!isEditing && (
        <Button variant="neoSecondary" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
          <Pen className="mr-2 h-4 w-4" />
          Edit table
        </Button>
      )}
    </div>
  );

  const renderTableView = () => (
    <div className="space-y-3">
      {isEditing ? (
        <div className="sticky top-4 z-20 rounded-[var(--neo-radius)] border-2 border-[var(--neo-warning)] bg-[var(--neo-surface)] px-4 py-3 shadow-[var(--neo-shadow)]">
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
                variant="neoSecondary"
                onClick={handleCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} variant="neo" className="w-full sm:w-auto">
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <NeoPanel className="overflow-hidden">
        <Table>
          {!isDesktop ? null : (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
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
                    );
                  })}
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
                    case "UNKNOWN":
                    default:
                      rowClassName = "border-l-4 border-slate-500 bg-slate-500/5";
                      break;
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
                      <TableRow key={row.id} className={`${rowClassName}`}>
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
                      onClick={() => handleRowClick((row.original as any).word)}
                    >
                      <TableCell className="p-4 flex flex-col gap-1 border-b border-border/10 w-full block">
                        <div className="flex justify-between items-start w-full">
                          <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-headline text-2xl font-bold text-primary truncate max-w-full">{(row.original as any).word}</h4>
                            <p className="text-muted-foreground italic text-sm truncate max-w-full">{(row.original as any).pronunciation}</p>
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <p className="text-foreground font-medium text-sm break-words">{(row.original as any).meaning}</p>
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
                    className={`${rowClassName} hover:bg-cyan-500/10 transition-colors duration-200 ${isEditing ? "cursor-default" : "cursor-pointer"}`}
                    onClick={() => handleRowClick((row.original as any).word)}
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </NeoPanel>
    </div>
  );

  return (
    <div>
      <NeoToolbar className="mb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full lg:max-w-md">{filterControls}</div>
          <div className="w-full lg:flex-1">{actionButtons}</div>
        </div>
      </NeoToolbar>
      <div className="mt-4">
        {renderTableView()}
      </div>

      {viewMode === "graph" && (
        <div className="fixed inset-0 z-[100] bg-zinc-50 flex flex-col">
          <div className="absolute top-4 right-4 z-[110] flex gap-2">
             <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTopicSwitcherOpen(true)}
                className="bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_black] font-black hover:-translate-y-1 transition-all"
             >
                <Command className="mr-2 h-4 w-4" />
                Switch Topic
             </Button>
             <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewMode("table")}
                className="bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_black] font-black hover:-translate-y-1 transition-all"
             >
                <TableIcon className="mr-2 h-4 w-4" />
                Back to Table
             </Button>
          </div>
          <VocabGraphViewer 
            vocabulary={visibleData as any[]} 
          />
        </div>
      )}

      <TopicSwitcher
        projectId={projectId}
        currentTopicId={topicId}
        isOpen={isTopicSwitcherOpen}
        onOpenChange={setIsTopicSwitcherOpen}
      />

      <KanjiDrawer
        word={selectedKanjiWord}
        isOpen={!!selectedKanjiWord}
        onOpenChange={(open) => !open && setSelectedKanjiWord(null)}
      />
    </div>
  );
}
