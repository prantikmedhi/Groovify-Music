"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"

interface Track {
  id: string
  name: string
}

interface AudioFeaturesChartProps {
  tracks: Track[]
  accessToken: string
}

interface AudioFeatures {
  danceability: number
  energy: number
  speechiness: number
  acousticness: number
  instrumentalness: number
  liveness: number
  valence: number
}

export function AudioFeaturesChart({ tracks, accessToken }: AudioFeaturesChartProps) {
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAudioFeatures()
  }, [tracks, accessToken])

  const fetchAudioFeatures = async () => {
    if (!tracks.length) return

    try {
      const trackIds = tracks.map((track) => track.id).join(",")
      const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const data = await response.json()

      if (data.audio_features) {
        const features = data.audio_features.filter(Boolean)
        const avgFeatures = {
          danceability: features.reduce((sum: number, f: any) => sum + f.danceability, 0) / features.length,
          energy: features.reduce((sum: number, f: any) => sum + f.energy, 0) / features.length,
          speechiness: features.reduce((sum: number, f: any) => sum + f.speechiness, 0) / features.length,
          acousticness: features.reduce((sum: number, f: any) => sum + f.acousticness, 0) / features.length,
          instrumentalness: features.reduce((sum: number, f: any) => sum + f.instrumentalness, 0) / features.length,
          liveness: features.reduce((sum: number, f: any) => sum + f.liveness, 0) / features.length,
          valence: features.reduce((sum: number, f: any) => sum + f.valence, 0) / features.length,
        }

        setAudioFeatures(avgFeatures)
      }
    } catch (error) {
      console.error("Error fetching audio features:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !audioFeatures) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Audio Features</CardTitle>
          <CardDescription className="text-gray-400 text-sm">Loading...</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading analysis...</div>
        </CardContent>
      </Card>
    )
  }

  const chartData = [
    { feature: "Dance", value: audioFeatures.danceability },
    { feature: "Energy", value: audioFeatures.energy },
    { feature: "Speech", value: audioFeatures.speechiness },
    { feature: "Acoustic", value: audioFeatures.acousticness },
    { feature: "Instrumental", value: audioFeatures.instrumentalness },
    { feature: "Live", value: audioFeatures.liveness },
    { feature: "Valence", value: audioFeatures.valence },
  ]

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base">Audio Features</CardTitle>
        <CardDescription className="text-gray-400 text-sm">Your music characteristics</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Value",
              color: "#22c55e",
            },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="feature" tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 1]} tick={{ fill: "#9ca3af", fontSize: 8 }} />
              <Radar
                name="Features"
                dataKey="value"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
