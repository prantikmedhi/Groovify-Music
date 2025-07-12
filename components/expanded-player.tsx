"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  ChevronDown,
  Heart,
  MoreHorizontal,
  Repeat,
  Shuffle,
} from "lucide-react"

interface Track {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: { name: string; images: Array<{ url: string }> }
  duration_ms: number
  preview_url: string | null
  popularity: number
  uri: string
}

interface ExpandedPlayerProps {
  currentTrack: Track | null
  isPlaying: boolean
  onPlayPause: () => void
  onClose: () => void
  accessToken: string
  onNext?: () => void
  onPrevious?: () => void
}

interface AudioFeatures {
  danceability: number
  energy: number
  valence: number
  tempo: number
  key: number
  mode: number
}

declare global {
  interface Window {
    spotifyPlayer?: any
  }
}

export function ExpandedPlayer({
  currentTrack,
  isPlaying,
  onPlayPause,
  onClose,
  accessToken,
  onNext,
  onPrevious,
}: ExpandedPlayerProps) {
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(50)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [shuffleEnabled, setShuffleEnabled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"off" | "context" | "track">("off")
  const [isPremium, setIsPremium] = useState(false)
  const [player, setPlayer] = useState<any>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [loadingFeatures, setLoadingFeatures] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get player instance from window (shared with WebPlayer)
  useEffect(() => {
    const checkForPlayer = () => {
      if (window.spotifyPlayer) {
        setPlayer(window.spotifyPlayer)
        setIsPremium(true)

        // Get current state
        window.spotifyPlayer.getCurrentState().then((state: any) => {
          if (state) {
            setCurrentTime(state.position / 1000)
            setDuration(state.duration / 1000)
            setProgress((state.position / state.duration) * 100)
          }
        })

        // Get volume
        window.spotifyPlayer.getVolume().then((vol: number) => {
          setVolume(vol * 100)
        })
      } else {
        setIsPremium(false)
      }
    }

    checkForPlayer()
    const interval = setInterval(checkForPlayer, 1000)

    return () => clearInterval(interval)
  }, [])

  // Handle preview playback for non-premium users
  useEffect(() => {
    if (!isPremium && currentTrack?.preview_url) {
      if (audio) {
        audio.pause()
        audio.remove()
      }

      const newAudio = new Audio(currentTrack.preview_url)
      newAudio.volume = volume / 100
      newAudio.crossOrigin = "anonymous"

      newAudio.addEventListener("loadedmetadata", () => {
        setDuration(newAudio.duration)
      })

      newAudio.addEventListener("timeupdate", () => {
        setCurrentTime(newAudio.currentTime)
        setProgress((newAudio.currentTime / newAudio.duration) * 100)
      })

      newAudio.addEventListener("ended", () => {
        // Auto-play next track if available
        if (onNext) {
          onNext()
        } else {
          onPlayPause()
        }
      })

      setAudio(newAudio)

      return () => {
        newAudio.pause()
        newAudio.remove()
      }
    }
  }, [currentTrack, isPremium])

  // Handle play/pause sync
  useEffect(() => {
    if (isPremium && player && currentTrack) {
      if (isPlaying) {
        playSpotifyTrack(currentTrack.uri)
      } else {
        player.pause()
      }
    } else if (!isPremium && audio) {
      if (isPlaying) {
        audio.play().catch(console.error)
      } else {
        audio.pause()
      }
    }
  }, [isPlaying, currentTrack, isPremium, player, audio])

  // Update progress for premium playback
  useEffect(() => {
    if (isPremium && isPlaying && player) {
      intervalRef.current = setInterval(() => {
        player.getCurrentState().then((state: any) => {
          if (state) {
            setCurrentTime(state.position / 1000)
            setDuration(state.duration / 1000)
            setProgress((state.position / state.duration) * 100)
            setShuffleEnabled(state.shuffle)
            setRepeatMode(state.repeat_mode === 0 ? "off" : state.repeat_mode === 1 ? "context" : "track")
          }
        })
      }, 1000)
    } else if (!isPremium && audio && isPlaying) {
      // Update progress for preview playback
      intervalRef.current = setInterval(() => {
        if (audio && !audio.paused) {
          setCurrentTime(audio.currentTime)
          setProgress((audio.currentTime / audio.duration) * 100)
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPremium, isPlaying, player, audio])

  useEffect(() => {
    if (currentTrack) {
      fetchAudioFeatures()
      checkIfLiked()
    }
  }, [currentTrack])

  // Set initial duration from track metadata
  useEffect(() => {
    if (currentTrack && !isPremium && !currentTrack.preview_url) {
      setDuration(currentTrack.duration_ms / 1000)
    }
  }, [currentTrack, isPremium])

  const playSpotifyTrack = async (uri: string) => {
    if (!player) return

    try {
      // Get device ID from player
      const state = await player.getCurrentState()
      if (state && state.device_id) {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${state.device_id}`, {
          method: "PUT",
          body: JSON.stringify({ uris: [uri] }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })
      }
    } catch (error) {
      console.error("Error playing track:", error)
    }
  }

  const fetchAudioFeatures = async () => {
    if (!currentTrack) return

    try {
      setLoadingFeatures(true)
      const response = await fetch(`https://api.spotify.com/v1/audio-features/${currentTrack.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAudioFeatures(data)
      } else {
        console.error("Failed to fetch audio features:", response.status)
        setAudioFeatures(null)
      }
    } catch (error) {
      console.error("Error fetching audio features:", error)
      setAudioFeatures(null)
    } finally {
      setLoadingFeatures(false)
    }
  }

  const checkIfLiked = async () => {
    if (!currentTrack) return

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${currentTrack.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data[0] || false)
      }
    } catch (error) {
      console.error("Error checking if track is liked:", error)
    }
  }

  const toggleLike = async () => {
    if (!currentTrack) return

    try {
      const method = isLiked ? "DELETE" : "PUT"
      const response = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${currentTrack.id}`, {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (response.ok) {
        setIsLiked(!isLiked)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleSkipNext = async () => {
    if (onNext) {
      onNext()
    } else if (isPremium && player) {
      await player.nextTrack()
    }
  }

  const handleSkipPrevious = async () => {
    if (onPrevious) {
      onPrevious()
    } else if (isPremium && player) {
      await player.previousTrack()
    }
  }

  const handleShuffle = async () => {
    if (isPremium && player) {
      try {
        const newShuffleState = !shuffleEnabled
        await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${newShuffleState}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        setShuffleEnabled(newShuffleState)
      } catch (error) {
        console.error("Error toggling shuffle:", error)
      }
    }
  }

  const handleRepeat = async () => {
    if (isPremium && player) {
      try {
        const nextMode = repeatMode === "off" ? "context" : repeatMode === "context" ? "track" : "off"
        await fetch(`https://api.spotify.com/v1/me/player/repeat?state=${nextMode}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        setRepeatMode(nextMode)
      } catch (error) {
        console.error("Error toggling repeat:", error)
      }
    }
  }

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (isPremium && player) {
      await player.setVolume(newVolume / 100)
    } else if (audio) {
      audio.volume = newVolume / 100
    }
  }

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration

    if (isPremium && player) {
      player.seek(newTime * 1000)
    } else if (audio) {
      audio.currentTime = newTime
      setCurrentTime(newTime)
      setProgress(value[0])
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getKeyName = (key: number) => {
    const keys = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
    return keys[key] || "Unknown"
  }

  const getModeName = (mode: number) => {
    return mode === 1 ? "Major" : "Minor"
  }

  if (!currentTrack) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ChevronDown className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-medium text-gray-400">Now Playing</h2>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Album Art */}
        <div className="flex justify-center mb-8">
          <img
            src={currentTrack.album.images[0]?.url || currentTrack.album.images[1]?.url}
            alt={currentTrack.album.name}
            className="w-80 h-80 rounded-lg shadow-2xl"
          />
        </div>

        {/* Track Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{currentTrack.name}</h1>
          <p className="text-lg text-gray-400 mb-4">{currentTrack.artists.map((artist) => artist.name).join(", ")}</p>
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="bg-green-500/10 text-green-400">
              {currentTrack.popularity}% Popular
            </Badge>
            {audioFeatures && (
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {getKeyName(audioFeatures.key)} {getModeName(audioFeatures.mode)}
              </Badge>
            )}
          </div>
        </div>

        {/* Premium Status */}
        {!isPremium && (
          <div className="text-center mb-4">
            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
              {currentTrack.preview_url ? "30s Preview" : "Preview Not Available"} - Spotify Premium required for full
              playback
            </Badge>
          </div>
        )}

        {/* Progress */}
        <div className="mb-8">
          <Slider value={[progress]} onValueChange={handleProgressChange} max={100} step={1} className="w-full mb-2" />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mb-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleShuffle}
            className={shuffleEnabled ? "text-green-500" : ""}
            disabled={!isPremium}
          >
            <Shuffle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="lg" onClick={handleSkipPrevious}>
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={onPlayPause}
            className="bg-white text-black hover:bg-gray-200 w-16 h-16 rounded-full"
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
          </Button>
          <Button variant="ghost" size="lg" onClick={handleSkipNext}>
            <SkipForward className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleRepeat}
            className={repeatMode !== "off" ? "text-green-500" : ""}
            disabled={!isPremium}
          >
            <div className="relative">
              <Repeat className="h-5 w-5" />
              {repeatMode === "track" && <span className="absolute -top-1 -right-1 text-xs font-bold">1</span>}
            </div>
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={toggleLike}>
            <Heart className={`h-5 w-5 ${isLiked ? "fill-green-500 text-green-500" : ""}`} />
          </Button>

          <div className="flex items-center space-x-2 flex-1 max-w-32 mx-4">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} className="flex-1" />
          </div>

          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Playback Status */}
        <div className="text-center mb-4">
          <div className="flex justify-center space-x-4 text-sm text-gray-400">
            {isPremium && (
              <>
                <span className={shuffleEnabled ? "text-green-400" : ""}>Shuffle: {shuffleEnabled ? "On" : "Off"}</span>
                <span className={repeatMode !== "off" ? "text-green-400" : ""}>
                  Repeat: {repeatMode === "off" ? "Off" : repeatMode === "context" ? "All" : "One"}
                </span>
              </>
            )}
            <span>Volume: {Math.round(volume)}%</span>
          </div>
        </div>

        {/* Audio Features */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <h3 className="text-white font-medium mb-3">Audio Features</h3>
            {loadingFeatures ? (
              <div className="text-center py-4">
                <div className="text-gray-400 text-sm">Loading audio features...</div>
              </div>
            ) : audioFeatures ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Danceability</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${audioFeatures.danceability * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-xs">{Math.round(audioFeatures.danceability * 100)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Energy</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${audioFeatures.energy * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-xs">{Math.round(audioFeatures.energy * 100)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Valence</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${audioFeatures.valence * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-xs">{Math.round(audioFeatures.valence * 100)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Tempo</p>
                  <p className="text-white">{Math.round(audioFeatures.tempo)} BPM</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-gray-400 text-sm">Audio features not available</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
