import { useState, useCallback, useRef, useMemo } from 'react';

export interface ColumnDef {
  key: string;
  label: string;
  visible: boolean;
  minWidth: number;
  width: number;
}

export function useResizableColumns(defaultColumns: ColumnDef[]) {
  const [columns, setColumns] = useState<ColumnDef[]>(defaultColumns);
  const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  const toggleColumn = useCallback((key: string) => {
    setColumns(prev => prev.map(col =>
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  }, []);

  const visibleColumns = useMemo(() => columns.filter(col => col.visible), [columns]);

  const handleResizeStart = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    const col = columns.find(c => c.key === columnKey);
    if (!col) return;
    resizingRef.current = { key: columnKey, startX: e.clientX, startWidth: col.width };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const diff = ev.clientX - resizingRef.current.startX;
      const newWidth = Math.max(50, resizingRef.current.startWidth + diff);
      setColumns(prev => prev.map(c =>
        c.key === resizingRef.current!.key ? { ...c, width: Math.max(c.minWidth, newWidth) } : c
      ));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [columns]);

  return { columns, visibleColumns, toggleColumn, handleResizeStart };
}
