import React from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings2 } from 'lucide-react';
import { ColumnDef } from '@/hooks/useResizableColumns';

interface ResizableDataTableProps {
  visibleColumns: ColumnDef[];
  handleResizeStart: (e: React.MouseEvent, key: string) => void;
  data: any[];
  renderCell: (item: any, columnKey: string) => React.ReactNode;
  rowKey: (item: any) => string;
  emptyMessage?: string;
}

export const ResizableDataTable: React.FC<ResizableDataTableProps> = ({
  visibleColumns,
  handleResizeStart,
  data,
  renderCell,
  rowKey,
  emptyMessage = 'No data found',
}) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          {visibleColumns.map((column, colIndex) => (
            <TableHead
              key={column.key}
              className="relative whitespace-nowrap overflow-hidden text-ellipsis"
              style={{ width: column.width, minWidth: column.minWidth, maxWidth: column.width }}
            >
              <span className="block truncate pr-2">{column.label}</span>
              {colIndex < visibleColumns.length - 1 && (
                <div
                  className="absolute right-0 top-0 bottom-0 w-[3px] cursor-col-resize z-10 group hover:bg-primary/30 flex items-center justify-center"
                  onMouseDown={(e) => handleResizeStart(e, column.key)}
                >
                  <div className="w-px h-full bg-border" />
                </div>
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={visibleColumns.length} className="text-center py-12 text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={rowKey(item)}>
              {visibleColumns.map((column, colIndex) => (
                <TableCell
                  key={column.key}
                  className="relative overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ width: column.width, minWidth: column.minWidth, maxWidth: column.width }}
                >
                  <div className="truncate">
                    {renderCell(item, column.key)}
                  </div>
                  {colIndex < visibleColumns.length - 1 && (
                    <div className="absolute right-0 top-0 bottom-0 w-px bg-border/40" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);

interface ManageColumnsButtonProps {
  columns: ColumnDef[];
  toggleColumn: (key: string) => void;
}

export const ManageColumnsButton: React.FC<ManageColumnsButtonProps> = ({ columns, toggleColumn }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <Settings2 className="h-4 w-4 mr-2" />
        Manage Columns
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {columns.map((column) => (
        <DropdownMenuCheckboxItem
          key={column.key}
          checked={column.visible}
          onCheckedChange={() => toggleColumn(column.key)}
        >
          {column.label}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
