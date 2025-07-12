"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Shuffle,
  Repeat,
  Maximize2,
  MoreHorizontal,
} from "lucide-react"

interface Track {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: { name: string; images: Array<{ url: string }> }
  duration_ms: number
  preview_url: string | null
}

interface WebPlayerProps {
  currentTrack: Track | null
  isPlaying: boolean
  onPlayPause: () => void
  onExpand: () => void
  accessToken: string
  onNext: () => void
  onPrevious: () => void
}

export function WebPlayer({
  currentTrack,
  isPlaying,
  onPlayPause,
  onExpand,
  accessToken,
  onNext,
  onPrevious,
}: WebPlayerProps) {
  const [volume, setVolume] = useState([50])
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState([0])
  const [duration, setDuration] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"off" | "context" | "track">("off")
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current && currentTrack?.preview_url) {
      audioRef.current.src = currentTrack.preview_url
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100

      if (isPlaying) {
        audioRef.current.play().catch(console.error)
      } else {
        audioRef.current.pause()
      }
    }
  }, [currentTrack, isPlaying, volume, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100
        setProgress([progressPercent])
        setDuration(audio.duration * 1000) // Convert to ms
      }
    }

    const handleEnded = () => {
      if (repeatMode === "track") {
        audio.currentTime = 0
        audio.play()
      } else {
        // Auto-play next track
        onNext()
      }
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("loadedmetadata", updateProgress)

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("loadedmetadata", updateProgress)
    }
  }, [repeatMode, onNext])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current && duration > 0) {
      const newTime = (value[0] / 100) * (duration / 1000)
      audioRef.current.currentTime = newTime
      setProgress(value)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100
    }
    if (value[0] > 0) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume[0] / 100 : 0
    }
  }

  const toggleRepeat = () => {
    const modes: Array<"off" | "context" | "track"> = ["off", "context", "track"]
    const currentIndex = modes.indexOf(repeatMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setRepeatMode(nextMode)
  }

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "track":
        return <Repeat className="h-4 w-4 text-green-500" />
      case "context":
        return <Repeat className="h-4 w-4 text-green-500" />
      default:
        return <Repeat className="h-4 w-4" />
    }
  }

  if (!currentTrack) {
    return null
  }

  return (
    <>
      <audio ref={audioRef} />

      {/* Mobile Player */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-40">
        {/* Progress Bar */}
        <div className="mb-3">
          <Slider value={progress} onValueChange={handleProgressChange} max={100} step={1} className="w-full" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime((progress[0] / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <img
            src={currentTrack.album.images[2]?.url || currentTrack.album.images[0]?.url}
            alt={currentTrack.album.name}
            className="w-12 h-12 rounded"
          />
          <div className="flex-1 min-w-0" onClick={onExpand}>
            <p className="font-medium text-white truncate text-sm">{currentTrack.name}</p>
            <p className="text-xs text-gray-400 truncate">
              {currentTrack.artists.map((artist) => artist.name).join(", ")}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setIsLiked(!isLiked)} className="p-2">
              <Heart className={`h-5 w-5 ${isLiked ? "fill-green-500 text-green-500" : "text-gray-400"}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onPlayPause} className="p-2">
              {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Player */}
      <div className="hidden lg:flex fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-40">
        <div className="flex items-center justify-between w-full">
          {/* Track Info */}
          <div className="flex items-center space-x-4 w-1/4">
            <img
              src={currentTrack.album.images[2]?.url || currentTrack.album.images[0]?.url}
              alt={currentTrack.album.name}
              className="w-14 h-14 rounded"
            />
            <div className="min-w-0">
              <p className="font-medium text-white truncate">{currentTrack.name}</p>
              <p className="text-sm text-gray-400 truncate">
                {currentTrack.artists.map((artist) => artist.name).join(", ")}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsLiked(!isLiked)} className="p-2">
              <Heart className={`h-4 w-4 ${isLiked ? "fill-green-500 text-green-500" : "text-gray-400"}`} />
            </Button>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center space-y-2 w-1/2">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setIsShuffled(!isShuffled)} className="p-2">
                <Shuffle className={`h-4 w-4 ${isShuffled ? "text-green-500" : "text-gray-400"}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onPrevious} className="p-2">
                <SkipBack className="h-5 w-5 text-gray-400 hover:text-white" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={onPlayPause}
                className="rounded-full bg-white hover:bg-gray-200 text-black p-2"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onNext} className="p-2">
                <SkipForward className="h-5 w-5 text-gray-400 hover:text-white" />
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleRepeat} className="p-2">
                {getRepeatIcon()}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-2 w-full">
              <span className="text-xs text-gray-400 w-10 text-right">
                {formatTime((progress[0] / 100) * duration)}
              </span>
              <Slider value={progress} onValueChange={handleProgressChange} max={100} step={1} className="flex-1" />
              <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume and Options */}
          <div className="flex items-center space-x-4 w-1/4 justify-end">
            <Button variant="ghost" size="sm" className="p-2">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleMute} className="p-2">
                {isMuted || volume[0] === 0 ? (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-gray-400" />
                )}
              </Button>
              <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-24" />
            </div>
            <Button variant="ghost" size="sm" onClick={onExpand} className="p-2">
              <Maximize2 className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
