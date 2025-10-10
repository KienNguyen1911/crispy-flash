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
          table.options.meta?.updateData(row.index, column.id, value);
        }}
      />
    );
  }

  return <span>{value}</span>;
};

export const columns: ColumnDef<Vocabulary>[] = [
  {
    accessorKey: "kanji",
    header: "Kanji",
    cell: EditableCell,
  },
  {
    accessorKey: "kana",
    header: "Kana",
    cell: EditableCell,
  },
  {
    accessorKey: "meaning",
    header: "Meaning",
    cell: EditableCell,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      // @ts-ignore
      const status = row.getValue("status") as string
      let variant: "success" | "secondary" | "destructive" | "outline" = "secondary";
      if (status === "REMEMBERED") {
        variant = "success"
      } else if (status === "NOT_REMEMBERED") {
        variant = "destructive"
      } else if (status === "UNKNOWN") {
        variant = "outline"
      }
      
      return <Badge variant={variant} className="capitalize">{status.toLowerCase().replace("_", " ")}</Badge>
    },
    enableHiding: true,
    filterFn: (row, columnId, filterValue) => {
      // Chỉ so sánh khi giá trị cột BẰNG CHÍNH XÁC giá trị bộ lọc
      // (filterValue phải là 'REMEMBERED', 'NOT_REMEMBERED', hoặc 'UNKNOWN')
      return row.getValue(columnId) === filterValue;
    },
  },
]