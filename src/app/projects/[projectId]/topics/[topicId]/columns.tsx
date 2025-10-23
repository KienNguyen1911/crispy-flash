"use client"

import * as React from "react"
import { ColumnDef, CellContext } from "@tanstack/react-table"
import { Vocabulary } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, XCircle, HelpCircle, Sparkles } from "lucide-react"

const getStatusIcon = (status: string) => {
  const iconClass = "h-4 w-4";
  switch (status) {
    case "REMEMBERED": return <CheckCircle className={`${iconClass} text-green-600`} />;
    case "NOT_REMEMBERED": return <XCircle className={`${iconClass} text-red-600`} />;
    case "NEW": return <Sparkles className={`${iconClass} text-blue-600`} />;
    default: return <HelpCircle className={`${iconClass} text-gray-600`} />;
  }
};

const EditableCell = ({
  getValue,
  row,
  column,
  table,
}: CellContext<Vocabulary, unknown>) => {
  const initialValue = getValue();
  const [value, setValue] = React.useState(initialValue);

  const isEditing = table.options.meta?.isEditing;

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (isEditing) {
    return (
      <Input
        value={value as string}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (table.options.meta?.updateData) {
            table.options.meta.updateData(row.index, column.id, value);
          }
        }}
      />
    );
  }

  return <span>{value as React.ReactNode}</span>;
};

export const columns: ColumnDef<Vocabulary>[] = [
  {
    accessorKey: "word",
    header: "Word",
    cell: EditableCell,
  },
  {
    accessorKey: "pronunciation",
    header: "Pronunciation",
    cell: EditableCell,
  },
  {
    accessorKey: "meaning",
    header: "Meaning",
    cell: EditableCell,
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex justify-center w-full">
        Status
      </div>
    ),
    cell: ({ row }) => {
      // @ts-ignore
      const status = row.getValue("status") as string
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help flex justify-center">
                {getStatusIcon(status)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{status?.replace('_', ' ') || 'Unknown'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableHiding: true,
    filterFn: (row, columnId, filterValue) => {
      // Chỉ so sánh khi giá trị cột BẰNG CHÍNH XÁC giá trị bộ lọc
      // (filterValue phải là 'REMEMBERED', 'NOT_REMEMBERED', hoặc 'UNKNOWN')
      return row.getValue(columnId) === filterValue;
    },
  },
]