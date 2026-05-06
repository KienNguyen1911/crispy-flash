"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";

import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";

import {
  Trash2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles
} from "lucide-react";
import {
  deleteVocabularies,
  updateVocabularies
} from "@/services/topics-vocabularies-api";
import { KanjiDrawer } from "@/components/vocabularies/KanjiDrawer";
import { m, AnimatePresence, LazyMotion } from "framer-motion";
import { domAnimation } from "framer-motion/m";
import { Button } from "@/components/ui/button";
import { DataTableCardsView } from "./data-table/DataTableCardsView";
import { DataTableTableView } from "./data-table/DataTableTableView";
import { DataTableHeader } from "./data-table/DataTableHeader";
import { DataTableGraphDialog } from "./data-table/DataTableGraphDialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  projectId: string;
  topicId: string;
}

interface TableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: Record<string, boolean>;
  viewMode: "table" | "cards";
  isGraphOpen: boolean;
}

type TableAction =
  | { type: "SET_SORTING"; payload: SortingState }
  | { type: "SET_COLUMN_FILTERS"; payload: ColumnFiltersState }
  | { type: "SET_COLUMN_VISIBILITY"; payload: VisibilityState }
  | { type: "SET_ROW_SELECTION"; payload: Record<string, boolean> }
  | { type: "SET_VIEW_MODE"; payload: "table" | "cards" }
  | { type: "SET_GRAPH_OPEN"; payload: boolean };

const tableReducer = (state: TableState, action: TableAction): TableState => {
  switch (action.type) {
    case "SET_SORTING":
      return { ...state, sorting: action.payload };
    case "SET_COLUMN_FILTERS":
      return { ...state, columnFilters: action.payload };
    case "SET_COLUMN_VISIBILITY":
      return { ...state, columnVisibility: action.payload };
    case "SET_ROW_SELECTION":
      return { ...state, rowSelection: action.payload };
    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };
    case "SET_GRAPH_OPEN":
      return { ...state, isGraphOpen: action.payload };
    default:
      return state;
  }
};

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  projectId,
  topicId
}: DataTableProps<TData, TValue>) {
  const [tableState, dispatch] = React.useReducer(tableReducer, {
    sorting: [],
    columnFilters: [],
    columnVisibility: {},
    rowSelection: {},
    viewMode: "cards",
    isGraphOpen: false,
  });

  const isEditingRef = React.useRef(false);
  const dataRef = React.useRef<TData[]>(initialData);
  const [, forceUpdate] = React.useState({});
  const deletedVocabularyIdsRef = React.useRef<Set<string>>(new Set());
  const selectedKanjiWordRef = React.useRef<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const data = dataRef.current;

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
  }, [columns]);

  // Compute visibility based on responsive state and editing mode
  const computedColumnVisibility = {
    status: isDesktop,
    actions: isEditingRef.current
  };

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
  }, [data, initialData]);

  const dirtyRowIds = React.useMemo(() => {
    const initialDataById = (initialData as any[]).reduce<Record<string, any>>(
      (acc, row) => {
        acc[row.id] = row;
        return acc;
      },
      {}
    );

    return new Set(
      (data as any[]).reduce<string[]>((acc, row) => {
        if (deletedVocabularyIdsRef.current.has((row as any).id)) {
          return acc;
        }

        const originalRow = initialDataById[(row as any).id];
        if (!originalRow) {
          return acc;
        }

        if (JSON.stringify(row) !== JSON.stringify(originalRow)) {
          acc.push((row as any).id);
        }
        return acc;
      }, [])
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
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(tableState.sorting) : updater;
      dispatch({ type: "SET_SORTING", payload: newSorting });
    },
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(tableState.columnFilters) : updater;
      dispatch({ type: "SET_COLUMN_FILTERS", payload: newFilters });
    },
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: (updater) => {
      const newVisibility = typeof updater === 'function' ? updater(tableState.columnVisibility) : updater;
      dispatch({ type: "SET_COLUMN_VISIBILITY", payload: newVisibility });
    },
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(tableState.rowSelection) : updater;
      dispatch({ type: "SET_ROW_SELECTION", payload: newSelection });
    },
    state: {
      sorting: tableState.sorting,
      columnFilters: tableState.columnFilters,
      columnVisibility: { ...tableState.columnVisibility, ...computedColumnVisibility },
      rowSelection: tableState.rowSelection
    },
    meta: {
      isEditing: isEditingRef.current,
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        dataRef.current = dataRef.current.map((row, index) => {
          if (index === rowIndex) {
            return {
              ...dataRef.current[rowIndex],
              [columnId]: value
            };
          }
          return row;
        });
        forceUpdate({});
      },
      deleteRow: (rowIndex: number) => {
        const idToDelete = (visibleData[rowIndex] as any).id;
        deletedVocabularyIdsRef.current.add(idToDelete);
        forceUpdate({});
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
        return originalRow && JSON.stringify(row) !== JSON.stringify(originalRow);
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

      const messages = [];
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
      isEditingRef.current = false;
      deletedVocabularyIdsRef.current.clear();
      selectedKanjiWordRef.current = null;
    }
  };

  const handleCancel = () => {
    dataRef.current = initialData;
    deletedVocabularyIdsRef.current.clear();
    isEditingRef.current = false;
    selectedKanjiWordRef.current = null;
    forceUpdate({});
  };

  const handleSwitchView = (nextViewMode: "table" | "cards") => {
    if (nextViewMode === "cards" && isEditingRef.current) {
      return;
    }
    dispatch({ type: "SET_VIEW_MODE", payload: nextViewMode });
  };

  const handleRowClick = (word: string) => {
    if (!isEditingRef.current) {
      selectedKanjiWordRef.current = word;
      dispatch({ type: "SET_GRAPH_OPEN", payload: true });
    }
  };

  const handleEditToggle = () => {
    isEditingRef.current = true;
    forceUpdate({});
  };

  return (
    <div>
      <DataTableHeader
        table={table}
        viewMode={tableState.viewMode}
        isEditing={isEditingRef.current}
        projectId={projectId}
        topicId={topicId}
        onViewModeChange={handleSwitchView}
        onGraphOpen={() => dispatch({ type: "SET_GRAPH_OPEN", payload: true })}
        onEditToggle={handleEditToggle}
      />
      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait">
          <m.div
            key={tableState.viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {tableState.viewMode === "table" ? (
              <DataTableTableView
                table={table}
                isEditing={isEditingRef.current}
                hasUnsavedChanges={hasUnsavedChanges}
                dirtyRowIds={dirtyRowIds}
                isDesktop={isDesktop}
                columnsLength={columns.length}
                onRowClick={handleRowClick}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <DataTableCardsView
                rows={table.getRowModel().rows}
                onRowClick={handleRowClick}
                getStatusIcon={getStatusIcon}
              />
            )}
          </m.div>
        </AnimatePresence>
      </LazyMotion>

      <DataTableGraphDialog
        isOpen={tableState.isGraphOpen}
        data={visibleData}
        onOpenChange={(open) => dispatch({ type: "SET_GRAPH_OPEN", payload: open })}
      />

      <KanjiDrawer
        word={selectedKanjiWordRef.current}
        isOpen={!!selectedKanjiWordRef.current}
        onOpenChange={(open) => !open && (selectedKanjiWordRef.current = null)}
      />
    </div>
  );
}
