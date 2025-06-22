// src/components/dashboard/recent-activity-chart.tsx
'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

// NOTE: In a real application, this data would be fetched from your database.
const chartData = [
  { date: 'Mon', signups: 8 },
  { date: 'Tue', signups: 12 },
  { date: 'Wed', signups: 5 },
  { date: 'Thu', signups: 15 },
  { date: 'Fri', signups: 18 },
  { date: 'Sat', signups: 25 },
  { date: 'Sun', signups: 22 },
];

const chartConfig = {
  signups: {
    label: 'Sign-ups',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function RecentActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sign-up Activity</CardTitle>
        <CardDescription>Sign-ups over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
