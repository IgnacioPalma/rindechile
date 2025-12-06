import type { Table } from "@tanstack/react-table";

interface ServerPaginationInfo {
  total: number;
  page: number;
  limit: number;
}

interface TableStatusProps<TData> {
  table: Table<TData>;
  serverPagination?: ServerPaginationInfo;
}

export function TableStatus<TData>({ table, serverPagination }: TableStatusProps<TData>) {
  // Use server pagination info when available, otherwise fall back to client-side
  const isServerMode = !!serverPagination;

  const totalRows = isServerMode
    ? serverPagination.total
    : table.getFilteredRowModel().rows.length;

  if (totalRows === 0) {
    return (
      <div className="flex-1 text-xs tablet:text-sm text-muted-foreground">
        Sin resultados
      </div>
    );
  }

  // Calculate row range based on pagination mode
  const startRow = isServerMode
    ? (serverPagination.page - 1) * serverPagination.limit + 1
    : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;

  const endRow = isServerMode
    ? Math.min(serverPagination.page * serverPagination.limit, totalRows)
    : Math.min(
        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
        totalRows
      );

  // Format numbers with thousand separators for better readability
  const formatNumber = (num: number) => num.toLocaleString('es-CL');

  return (
    <div className="flex-1 text-xs tablet:text-sm text-muted-foreground">
      {/* Mobile: Compact format */}
      <span className="tablet:hidden">
        <span className="font-medium text-foreground">{formatNumber(startRow)}-{formatNumber(endRow)}</span>
        {' '}de{' '}
        <span className="font-medium text-foreground">{formatNumber(totalRows)}</span>
      </span>

      {/* Tablet and up: Full format */}
      <span className="hidden tablet:inline">
        Mostrando filas{' '}
        <span className="font-medium text-foreground">{formatNumber(startRow)}</span>
        {' '}a{' '}
        <span className="font-medium text-foreground">{formatNumber(endRow)}</span>
        {' '}de{' '}
        <span className="font-medium text-foreground">{formatNumber(totalRows)}</span>
        {' '}{totalRows === 1 ? 'compra' : 'compras'}
      </span>
    </div>
  );
}
