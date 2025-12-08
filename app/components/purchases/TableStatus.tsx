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

  const statusText = `Mostrando filas ${formatNumber(startRow)} a ${formatNumber(endRow)} de ${formatNumber(totalRows)} ${totalRows === 1 ? 'compra' : 'compras'}`;

  return (
    <div className="flex-1 text-xs tablet:text-sm text-muted-foreground">
      {/* Screen reader live region */}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusText}
      </span>

      {/* Mobile: Compact format */}
      <span className="tablet:hidden" aria-hidden="true">
        <span className="font-medium text-foreground">{formatNumber(startRow)}-{formatNumber(endRow)}</span>
        {' '}de{' '}
        <span className="font-medium text-foreground">{formatNumber(totalRows)}</span>
      </span>

      {/* Tablet and up: Full format */}
      <span className="hidden tablet:inline" aria-hidden="true">
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
