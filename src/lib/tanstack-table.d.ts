import { RowData } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    isEditing?: boolean
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void
  }
}