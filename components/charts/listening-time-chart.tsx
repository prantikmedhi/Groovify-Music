"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface RecentTrack {
  track: {
    duration_ms: number
  }
  played_at: string
}

interface ListeningTimeChartProps {
  recentTracks: RecentTrack[]
}

export function ListeningTimeChart({ recentTracks }: ListeningTimeChartProps) {
  // Group tracks by hour of day
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const tracksInHour = recentTracks.filter((track) => {
      const playedHour = new Date(track.played_at).getHours()
      return playedHour === hour
    })

    return {
      hour: hour.toString().padStart(2, "0") + ":00",
      tracks: tracksInHour.length,
      minutes: Math.round(tracksInHour.reduce((sum, track) => sum + track.track.duration_ms, 0) / 60000),
    }
  })

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Listening Activity</CardTitle>
        <CardDescription className="text-gray-400">Your listening patterns throughout the day</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            tracks: {
              label: "Tracks",
              color: "#22c55e",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <XAxis dataKey="hour" tick={{ fill: "#9ca3af", fontSize: 12 }} interval={2} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
              />
              <Line
                type="monotone"
                dataKey="tracks"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#22c55e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
