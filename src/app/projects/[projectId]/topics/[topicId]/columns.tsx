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
    case "REMEMBERED": return <CheckCircle className={`${iconClass} text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]`} />;
    case "NOT_REMEMBERED": return <XCircle className={`${iconClass} text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.4)]`} />;
    case "NEW": return <Sparkles className={`${iconClass} text-sky-500 drop-shadow-[0_0_5px_rgba(14,165,233,0.4)]`} />;
    default: return <HelpCircle className={`${iconClass} text-slate-500`} />;
  }
};

const EditableCell = ({
  getValue,
  row,
  column,
  table,
  className,
}: CellContext<Vocabulary, unknown> & { className?: string }) => {
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
        className={className}
      />
    );
  }

  return <span className={className}>{value as React.ReactNode}</span>;
};

export const columns: ColumnDef<Vocabulary>[] = [
  {
    accessorKey: "word",
    header: "Word",
    cell: (props) => <EditableCell {...props} className="font-headline text-xl md:text-2xl font-bold tracking-wide text-foreground break-words" />,
  },
  {
    accessorKey: "pronunciation",
    header: "Pronunciation",
    cell: (props) => <EditableCell {...props} className="text-muted-foreground italic text-sm md:text-lg break-words" />,
  },
  {
    accessorKey: "meaning",
    header: "Meaning",
    cell: (props) => <EditableCell {...props} className="text-sm md:text-lg w-full break-words" />,
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