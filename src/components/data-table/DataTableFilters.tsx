"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Table as TanstackTable } from "@tanstack/react-table";

interface DataTableFiltersProps<TData> {
  table: TanstackTable<TData>;
}

export function DataTableFilters<TData>({
  table
}: DataTableFiltersProps<TData>) {
  return (
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
}
