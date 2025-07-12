"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface Track {
  id: string
  name: string
  artists: Array<{ name: string }>
  popularity: number
}

interface TopTracksChartProps {
  tracks: Track[]
}

export function TopTracksChart({ tracks }: TopTracksChartProps) {
  const chartData = tracks.slice(0, 8).map((track, index) => ({
    name: track.name.length > 12 ? track.name.substring(0, 12) + "..." : track.name,
    popularity: track.popularity,
    rank: index + 1,
  }))

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base">Track Popularity</CardTitle>
        <CardDescription className="text-gray-400 text-sm">Your top tracks popularity scores</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            popularity: {
              label: "Popularity",
              color: "#22c55e",
            },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
              />
              <Bar dataKey="popularity" fill="#22c55e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
