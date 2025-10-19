"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthFetcher } from "@/hooks/useAuthFetcher"
import { useMediaQuery } from "@/hooks/use-media-query"
import { toast } from "sonner"

import { BookOpenCheck, Pen, Plus, Trash2, Grid, Table as TableIcon, CheckCircle, XCircle, HelpCircle, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { deleteVocabularies, updateVocabularies } from "@/services/topics-vocabularies-api"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  projectId: string
  topicId: string
  hasVocabulary: boolean
  setIsLearnMode: (isLearnMode: boolean) => void
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  projectId,
  topicId,
  hasVocabulary,
  setIsLearnMode,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [isEditing, setIsEditing] = React.useState(false)
  const [data, setData] = React.useState(initialData);
  const [deletedVocabularyIds, setDeletedVocabularyIds] = React.useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');
  const [globalFilter, setGlobalFilter] = React.useState('')
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
      },
    };
    return [...columns, actionColumn];
  }, [columns]);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    setColumnVisibility(current => ({...current, status: isDesktop, actions: isEditing }))
  }, [isDesktop, isEditing]);

  const visibleData = React.useMemo(() => data.filter(row => !deletedVocabularyIds.has((row as any).id)), [data, deletedVocabularyIds]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'REMEMBERED':
        return 'default';
      case 'NOT_REMEMBERED':
        return 'destructive';
      case 'NEW':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeClassName = (status: string) => {
    switch (status) {
      case 'REMEMBERED':
        return 'bg-green-500 hover:bg-green-600';
      case 'NOT_REMEMBERED':
        return 'bg-red-500 hover:bg-red-600';
      case 'NEW':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "h-4 w-4";
    switch (status) {
      case "REMEMBERED": return <CheckCircle className={`${iconClass} text-green-600`} />;
      case "NOT_REMEMBERED": return <XCircle className={`${iconClass} text-red-600`} />;
      case "NEW": return <Sparkles className={`${iconClass} text-blue-600`} />;
      default: return <HelpCircle className={`${iconClass} text-gray-600`} />;
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
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    meta: {
      isEditing,
      updateData: (rowIndex, columnId, value) => {
        setData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              }
            }
            return row
          })
        )
      },
      deleteRow: (rowIndex: number) => {
        const idToDelete = (visibleData[rowIndex] as any).id;
        setDeletedVocabularyIds(old => new Set(old).add(idToDelete));
      },
    },
  })

  const handleSave = async () => {
    try {
      const initialDataById = (initialData as any[]).reduce((acc, row) => {
        acc[row.id] = row;
        return acc;
      }, {});

      const changedVocabularies = (data as any[]).filter(row => {
        if (deletedVocabularyIds.has((row as any).id)) return false;
        const originalRow = initialDataById[(row as any).id];
        if (!originalRow) {
            return false;
        }
        return JSON.stringify(row) !== JSON.stringify(originalRow);
      });

      const deletePromise = deletedVocabularyIds.size > 0
      ? deleteVocabularies(topicId, Array.from(deletedVocabularyIds))
      : Promise.resolve();

      const updatePromise = changedVocabularies.length > 0
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
        toast.success(messages.join(' and ') + ' successfully.');
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

  const filterControls = (
    <div className="flex items-center gap-2 justify-start">
      <Input
        placeholder="Filter meanings..."
        value={(table.getColumn("meaning")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("meaning")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
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
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="REMEMBERED">Remembered</SelectItem>
          <SelectItem value="NOT_REMEMBERED">Not Remembered</SelectItem>
          <SelectItem value="UNKNOWN">UNKNOWN</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const actionButtons = (
    <div className="flex items-center gap-2">
        <Button
            onClick={() => setIsLearnMode(true)}
            disabled={!hasVocabulary}
        >
            <BookOpenCheck className="mr-2 h-4 w-4" />
            Learn
        </Button>
        <Link href={`/projects/${projectId}/topics/${topicId}/import`}>
            <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Import
            </Button>
        </Link>
      {isEditing ? (
        <>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      ) : (
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          <Pen className="mr-2 h-4 w-4" />
          Edit
        </Button>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
        title={`Switch to ${viewMode === 'table' ? 'cards' : 'table'} view`}
      >
        {viewMode === 'table' ? <Grid className="h-4 w-4" /> : <TableIcon className="h-4 w-4" />}
      </Button>
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
          <h3 className="text-lg font-semibold text-foreground mb-1">No vocabulary found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or add new vocabulary</p>
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
              <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl lg:text-2xl font-bold text-primary mb-2 break-words">
                        {item.word}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-muted-foreground italic break-words">
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
                            <p>{item.status?.replace('_', ' ') || 'Unknown'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground leading-relaxed">
                    {item.meaning}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )})}
      </AnimatePresence>
    </div>
    );
  };

  const renderTableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className={!isDesktop ? "w-1/3" : undefined}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const status = (row.original as any).status;
              let rowClassName = "";
              if (!isDesktop) {
                switch (status) {
                  case "REMEMBERED":
                    rowClassName = "bg-green-200 dark:bg-emerald-800/60";
                    break;
                  case "NOT_REMEMBERED":
                    rowClassName = "bg-red-200 dark:bg-rose-900/60";
                    break;
                  case "NEW":
                    rowClassName = "bg-blue-200 dark:bg-blue-800/60";
                    break;
                  case "UNKNOWN":
                  default:
                    rowClassName = "bg-slate-100 dark:bg-slate-800/50";
                    break;
                }
              }
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={rowClassName}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={!isDesktop ? "w-1/3" : undefined}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
    </div>
  );

  return (
    <div>
      <div className="py-4">
        {isDesktop ? (
            <div className="flex items-center justify-between">
                {filterControls}
                {actionButtons}
            </div>
        ) : (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between">{actionButtons}</div>
                {filterControls}
            </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'table' ? renderTableView() : renderCardsView()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}