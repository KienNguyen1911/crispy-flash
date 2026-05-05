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
  Blocks,
  Grid,
  Table as TableIcon,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  Network
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  deleteVocabularies,
  updateVocabularies
} from "@/services/topics-vocabularies-api";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KanjiDrawer } from "@/components/vocabularies/KanjiDrawer";
import { motion, AnimatePresence } from "framer-motion";
import VocabGraphViewer from "@/components/graph/VocabGraphViewer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isEditing, setIsEditing] = React.useState(false);
  const [data, setData] = React.useState<TData[]>([]);
  const deletedVocabularyIdsRef = React.useRef<Set<string>>(new Set());
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("cards");
  const [isGraphOpen, setIsGraphOpen] = React.useState(false);
  const selectedKanjiWordRef = React.useRef<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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

  // Compute visibility based on responsive state and editing mode
  const computedColumnVisibility = React.useMemo(() => ({
    status: isDesktop,
    actions: isEditing
  }), [isDesktop, isEditing]);

  const visibleData = React.useMemo(
    () => data.filter((row) => !deletedVocabularyIdsRef.current.has((row as any).id)),
    [data]
  );

  const hasUnsavedChanges = React.useMemo(() => {
    if (deletedVocabularyIdsRef.current.size > 0) {
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
          if (deletedVocabularyIdsRef.current.has((row as any).id)) {
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
  }, [data, initialData]);

  const getStatusIcon = (status: string) => {
    const iconClass = "h-4 w-4";
    switch (status) {
      case "REMEMBERED": return <CheckCircle className={`${iconClass} text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]`} />;
      case "NOT_REMEMBERED": return <XCircle className={`${iconClass} text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.4)]`} />;
      case "NEW": return <Sparkles className={`${iconClass} text-sky-500 drop-shadow-[0_0_5px_rgba(14,165,233,0.4)]`} />;
      default: return <HelpCircle className={`${iconClass} text-slate-500`} />;
    }
  };

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
      columnVisibility: { ...columnVisibility, ...computedColumnVisibility },
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
        deletedVocabularyIdsRef.current.add(idToDelete);
        // Force re-render by updating a state
        setData(d => [...d]);
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
        if (deletedVocabularyIdsRef.current.has((row as any).id)) return false;
        const originalRow = initialDataById[(row as any).id];
        if (!originalRow) {
          return false;
        }
        return JSON.stringify(row) !== JSON.stringify(originalRow);
      });

      const deletePromise =
        deletedVocabularyIdsRef.current.size > 0
          ? deleteVocabularies(topicId, Array.from(deletedVocabularyIdsRef.current))
          : Promise.resolve();

      const updatePromise =
        changedVocabularies.length > 0
          ? updateVocabularies(topicId, changedVocabularies)
          : Promise.resolve();

      await Promise.all([deletePromise, updatePromise]);

      let messages = [];
      if (deletedVocabularyIdsRef.current.size > 0) {
        messages.push(`${deletedVocabularyIdsRef.current.size} vocabularies deleted`);
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
      deletedVocabularyIdsRef.current.clear();
      selectedKanjiWordRef.current = null;
    }
  };

  const handleCancel = () => {
    setData(initialData);
    deletedVocabularyIdsRef.current.clear();
    setIsEditing(false);
    selectedKanjiWordRef.current = null;
  };

  const handleSwitchView = (nextViewMode: "table" | "cards") => {
    if (nextViewMode === "cards" && isEditing) {
      return;
    }

    setViewMode(nextViewMode);
  };

  const handleRowClick = (word: string) => {
    if (!isEditing) {
      selectedKanjiWordRef.current = word;
      setIsGraphOpen(true);
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
        <SelectTrigger className="w-full border-border/60 bg-background/40 sm:w-[180px]">
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
          <Button variant="outline" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Import
          </Button>
        </Link>
      ) : null}
      <div className="flex w-full items-center rounded-md border border-border/60 bg-background/40 p-1 sm:w-auto">
        <Button
          variant={viewMode === "cards" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSwitchView("cards")}
          disabled={isEditing}
          title={isEditing ? "Finish editing before switching to cards" : "Cards view"}
          className="flex-1 sm:flex-none"
        >
          <Blocks className="mr-2 h-4 w-4" />
          Cards
        </Button>
        <Button
          variant={viewMode === "table" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSwitchView("table")}
          title="Table view"
          className="flex-1 sm:flex-none"
        >
          <TableIcon className="mr-2 h-4 w-4" />
          Table
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsGraphOpen(true)}
          title="Graph view"
          className="flex-1 sm:flex-none"
        >
          <Network className="mr-2 h-4 w-4" />
          Graph
        </Button>
      </div>
      {viewMode === "table" ? (
        isEditing ? (
          null
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
            <Pen className="mr-2 h-4 w-4" />
            Edit table
          </Button>
        )
      ) : (
        <Badge variant="outline" className="h-9 justify-center px-3 sm:justify-start">
          Cards are view-only
        </Badge>
      )}
    </div>
  );

  const renderCardsView = () => {
    const rows = table.getRowModel().rows;

    if (rows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground mb-2">
            <Grid className="h-12 w-12 mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No vocabulary found
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            Try adjusting your filters or add new vocabulary
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {rows.map((row, index) => {
            const item = row.original as any;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="h-full"
              >
                <Card
                  className="group h-full bg-card/50 backdrop-blur-sm border-white/5 shadow-md hover:shadow-glow transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleRowClick(item.word)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl lg:text-2xl font-bold text-primary mb-2 break-words">
                          {item.word}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm md:text-base text-muted-foreground italic break-words">
                            {item.pronunciation}
                          </p>
                          {item.part_of_speech && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              {item.part_of_speech}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                {getStatusIcon(item.status)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {item.status?.replace("_", " ") || "Unknown"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm md:text-base text-foreground leading-relaxed">
                      {item.meaning}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  const renderTableView = () => (
    <div className="space-y-3">
      {isEditing ? (
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
                onClick={handleCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="w-full sm:w-auto">
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <Card className="rounded-xl border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden shadow-lg">
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
                    className={`${rowClassName} hover:bg-muted/50 transition-colors duration-200 ${isEditing ? "cursor-default" : "cursor-pointer"}`}
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
      </Card>
    </div>
  );

  return (
    <div>
      <div className="py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full lg:max-w-md">{filterControls}</div>
          <div className="w-full lg:flex-1">{actionButtons}</div>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === "table" ? renderTableView() : renderCardsView()}
        </motion.div>
      </AnimatePresence>

      <Dialog open={isGraphOpen} onOpenChange={setIsGraphOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 border-none overflow-hidden [&>button]:z-[60] [&>button]:bg-white [&>button]:text-black [&>button]:border-[3px] [&>button]:border-black [&>button]:shadow-[2px_2px_0px_black] [&>button]:opacity-100 [&>button:hover]:bg-zinc-100 bg-zinc-50">
          <DialogTitle className="sr-only">Whiteboard Graph View</DialogTitle>
          <VocabGraphViewer vocabulary={visibleData as any[]} />
        </DialogContent>
      </Dialog>

      <KanjiDrawer
        word={selectedKanjiWordRef.current}
        isOpen={!!selectedKanjiWordRef.current}
        onOpenChange={(open) => !open && (selectedKanjiWordRef.current = null)}
      />
    </div>
  );
}
