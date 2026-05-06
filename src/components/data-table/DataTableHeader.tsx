"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import { DataTableFilters } from "./DataTableFilters";
import { DataTableActions } from "./DataTableActions";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
  viewMode: "table" | "cards";
  isEditing: boolean;
  projectId: string;
  topicId: string;
  onViewModeChange: (mode: "table" | "cards") => void;
  onGraphOpen: () => void;
  onEditToggle: () => void;
}

export function DataTableHeader<TData>({
  table,
  viewMode,
  isEditing,
  projectId,
  topicId,
  onViewModeChange,
  onGraphOpen,
  onEditToggle
}: DataTableHeaderProps<TData>) {
  return (
    <div className="py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full lg:max-w-md">
          <DataTableFilters table={table} />
        </div>
        <div className="w-full lg:flex-1">
          <DataTableActions
            viewMode={viewMode}
            isEditing={isEditing}
            projectId={projectId}
            topicId={topicId}
            onViewModeChange={onViewModeChange}
            onGraphOpen={onGraphOpen}
            onEditToggle={onEditToggle}
          />
        </div>
      </div>
    </div>
  );
}
