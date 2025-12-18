"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart"

const chartData = [
  { month: "Ene", anomalies: 7.5 },
  { month: "Feb", anomalies: 15.2 },
  { month: "Mar", anomalies: 4.8 },
  { month: "Abr", anomalies: 18.3 },
  { month: "May", anomalies: 3.7 },
  { month: "Jun", anomalies: 19.1 },
]

const chartConfig = {
  anomalies: {
    label: "Anomalias",
    color: "oklch(0.6348 0.229457 33.7977)",
  },
} satisfies ChartConfig

export function AnomaliesAreaChart() {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full rounded-lg border border-border">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{top: 6, bottom: 6, left: 0, right: 0}}
      >
        <CartesianGrid vertical={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient id="fillAnomalies" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-anomalies)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-anomalies)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area
          dataKey="anomalies"
          type="natural"
          fill="url(#fillAnomalies)"
          fillOpacity={0.2}
          stroke="var(--color-anomalies)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
