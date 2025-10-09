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

import { BookOpenCheck, Pen, Plus } from "lucide-react";
import { apiClient } from "@/lib/api"
import Link from "next/link"

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
  const isDesktop = useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    setColumnVisibility(current => ({...current, status: isDesktop }))
  }, [isDesktop]);

  const table = useReactTable({
    data,
    columns,
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
      rowSelection,
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
    },
  })

  const handleSave = async () => {
    try {
      const initialDataById = (initialData as any[]).reduce((acc, row) => {
        acc[row.id] = row;
        return acc;
      }, {});

      const changedVocabularies = (data as any[]).filter(row => {
        const originalRow = initialDataById[row.id];
        if (!originalRow) {
            return false;
        }
        return JSON.stringify(row) !== JSON.stringify(originalRow);
      });


      if (changedVocabularies.length === 0) {
        toast.info("No changes to save.");
        setIsEditing(false);
        return;
      }

      await apiClient(`/api/topics/${topicId}/vocabularies`,
      {
        method: 'PUT',
        body: JSON.stringify({ vocabularies: changedVocabularies }),
      });
      toast.success(`${changedVocabularies.length} vocabularies updated successfully`);
    } catch (error) {
      toast.error("Failed to update vocabularies");
    }
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
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      ) : (
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          <Pen className="mr-2 h-4 w-4" />
          Edit
        </Button>
      )}
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                      <TableCell key={cell.id}>
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

    </div>
  )
}