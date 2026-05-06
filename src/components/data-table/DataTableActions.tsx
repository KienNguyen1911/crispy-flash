"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pen,
  Plus,
  Blocks,
  Table as TableIcon,
  Network
} from "lucide-react";

interface DataTableActionsProps {
  viewMode: "table" | "cards";
  isEditing: boolean;
  projectId: string;
  topicId: string;
  onViewModeChange: (mode: "table" | "cards") => void;
  onGraphOpen: () => void;
  onEditToggle: () => void;
}

export function DataTableActions({
  viewMode,
  isEditing,
  projectId,
  topicId,
  onViewModeChange,
  onGraphOpen,
  onEditToggle
}: DataTableActionsProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      {!isEditing && (
        <Link href={`/projects/${projectId}/topics/${topicId}/import`}>
          <Button variant="outline" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Import
          </Button>
        </Link>
      )}
      <div className="flex w-full items-center rounded-md border border-border/60 bg-background/40 p-1 sm:w-auto">
        <Button
          variant={viewMode === "cards" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("cards")}
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
          onClick={() => onViewModeChange("table")}
          title="Table view"
          className="flex-1 sm:flex-none"
        >
          <TableIcon className="mr-2 h-4 w-4" />
          Table
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onGraphOpen}
          title="Graph view"
          className="flex-1 sm:flex-none"
        >
          <Network className="mr-2 h-4 w-4" />
          Graph
        </Button>
      </div>
      {viewMode === "table" ? (
        isEditing ? null : (
          <Button
            variant="outline"
            onClick={onEditToggle}
            className="w-full sm:w-auto"
          >
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
}
