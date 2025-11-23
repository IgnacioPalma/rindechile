'use client';

import type { MunicipalityData } from '@/types/map';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';

interface MunicipalityPanelProps {
  municipalityName: string | null;
  regionName: string | null;
  data: MunicipalityData | null;
}

// Helper function to get severity level and badge variant
function getSeverityInfo(percentage: number): {
  level: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  color: string;
} {
  if (percentage <= 12) {
    return { level: 'Bajo', variant: 'secondary', color: 'text-yellow-600' };
  } else if (percentage <= 18) {
    return { level: 'Medio', variant: 'outline', color: 'text-pink-600' };
  } else {
    return { level: 'Alto', variant: 'destructive', color: 'text-red-600' };
  }
}

export function MunicipalityPanel({
  municipalityName,
  regionName,
  data,
}: MunicipalityPanelProps) {
  // Empty state when no municipality is selected
  if (!municipalityName) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center px-6 py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Click a municipality to explore
          </h3>
          <p className="text-sm text-gray-500">
            Select a municipality on the map to view detailed overpricing data
          </p>
        </div>
      </div>
    );
  }

  // No data available for selected municipality
  if (!data) {
    return (
      <div className="h-full overflow-y-auto bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{municipalityName}</h2>
          <p className="text-sm text-gray-600 mt-1">{regionName}</p>
        </div>
        <div className="py-12 text-center text-gray-500">
          No overpricing data available for this municipality.
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CL').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  const severityInfo = getSeverityInfo(data.porcentaje_sobreprecio);

  return (
    <div className="h-full overflow-y-auto bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900">{municipalityName}</h2>
            <p className="text-sm text-gray-600 mt-1">{regionName}</p>
          </div>
          <Badge variant={severityInfo.variant} className="text-sm ml-4 shrink-0">
            {severityInfo.level}
          </Badge>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-pink-50 to-cyan-50 rounded-lg p-6 border border-gray-200 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Overpricing Percentage</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-[#ED2472] to-[#68CCDB] bg-clip-text text-transparent">
            {formatPercentage(data.porcentaje_sobreprecio)}
          </p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="rounded-lg border border-gray-200 mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/3">Metric</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Overpriced Purchases</TableCell>
              <TableCell className="text-right font-mono">
                {formatNumber(data.compras_caras)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Total Purchases</TableCell>
              <TableCell className="text-right font-mono">
                {formatNumber(data.compras_totales)}
              </TableCell>
            </TableRow>
            <TableRow className="bg-gray-50">
              <TableCell className="font-medium">Overpricing Rate</TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {formatPercentage(data.porcentaje_sobreprecio)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Ratio</TableCell>
              <TableCell className="text-right font-mono text-sm text-gray-600">
                {data.compras_caras} / {data.compras_totales}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Footer Note */}
      <p className="text-xs text-gray-500 text-center">
        Data represents the percentage of purchases with overpricing issues
      </p>
    </div>
  );
}
