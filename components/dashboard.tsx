"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LogOut,
  Music,
  Search,
  Play,
  ChevronLeft,
  Home,
  Library,
  Clock,
  Heart,
  Plus,
  Download,
  ChevronRight,
  Pause,
  BarChart3,
  Users,
  Award,
  Sparkles,
  Menu,
  X,
  TrendingUp,
  Shuffle,
} from "lucide-react"
import { WebPlayer } from "@/components/web-player"
import { ExpandedPlayer } from "@/components/expanded-player"
import { LoadingScreen } from "@/components/loading-screen"

interface DashboardProps {
  accessToken: string
  onLogout: () => void
}

interface UserProfile {
  display_name: string
  email: string
  images: Array<{ url: string }>
  followers: { total: number }
  country: string
  product: string
}

interface Track {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: { name: string; images: Array<{ url: string }> }
  popularity: number
  duration_ms: number
  uri: string
  preview_url: string | null
}

interface Artist {
  id: string
  name: string
  images: Array<{ url: string }>
  genres: string[]
  popularity: number
  followers: { total: number }
}

interface Playlist {
  id: string
  name: string
  images: Array<{ url: string }>
  tracks: { total: number }
  description: string
  owner: { display_name: string }
  public: boolean
}

interface SearchResults {
  tracks: { items: Track[] }
  artists: { items: Artist[] }
}

interface PlaylistTrack {
  track: Track
}

export function Dashboard({ accessToken, onLogout }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [topTracks, setTopTracks] = useState<Track[]>([])
  const [topArtists, setTopArtists] = useState<Artist[]>([])
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedSongs, setLikedSongs] = useState<Track[]>([])
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([])
  const [recommendations, setRecommendations] = useState<Track[]>([])
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showExpandedPlayer, setShowExpandedPlayer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"short_term" | "medium_term" | "long_term">("medium_term")
  const [activeTab, setActiveTab] = useState("home")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([])
  const [loadingPlaylist, setLoadingPlaylist] = useState(false)
  const [currentQueue, setCurrentQueue] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  // View states for "Show all" functionality
  const [showAllRecommendations, setShowAllRecommendations] = useState(false)
  const [showAllRecentTracks, setShowAllRecentTracks] = useState(false)
  const [showAllTopArtists, setShowAllTopArtists] = useState(false)
  const [showAllPlaylists, setShowAllPlaylists] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [accessToken, timeRange])

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        searchMusic(searchQuery)
      }, 500)
      return () => clearTimeout(debounceTimer)
    } else {
      setSearchResults(null)
    }
  }, [searchQuery])

  const fetchSpotifyData = async (endpoint: string) => {
    try {
      const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      throw error
    }
  }

  const fetchRecommendations = async (seedTracks: string[], seedArtists: string[], seedGenres: string[] = []) => {
    try {
      // Limit to max 5 seeds total
      let endpoint = "/recommendations?limit=20"

      if (seedTracks.length > 0) {
        endpoint += `&seed_tracks=${seedTracks.slice(0, 2).join(",")}`
      }
      if (seedArtists.length > 0) {
        endpoint += `&seed_artists=${seedArtists.slice(0, 2).join(",")}`
      }
      if (seedGenres.length > 0) {
        endpoint += `&seed_genres=${seedGenres.slice(0, 1).join(",")}`
      }

      console.log("🎧 Fetching recommendations with endpoint:", endpoint)
      const data = await fetchSpotifyData(endpoint)

      console.log("🎧 Recommended Tracks:")
      data.tracks.forEach((track: Track) => {
        console.log(`${track.name} by ${track.artists.map((artist) => artist.name).join(", ")}`)
      })

      return data.tracks
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      return []
    }
  }

  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Fetch basic data first
      const [profileData, topTracksData, topArtistsData, recentTracksData, playlistsData] = await Promise.allSettled([
        fetchSpotifyData("/me"),
        fetchSpotifyData(`/me/top/tracks?limit=50&time_range=${timeRange}`),
        fetchSpotifyData(`/me/top/artists?limit=50&time_range=${timeRange}`),
        fetchSpotifyData("/me/player/recently-played?limit=50"),
        fetchSpotifyData("/me/playlists?limit=50"),
      ])

      // Handle profile data
      if (profileData.status === "fulfilled") {
        setProfile(profileData.value)
      }

      // Handle top tracks
      if (topTracksData.status === "fulfilled") {
        setTopTracks(topTracksData.value.items || [])
      }

      // Handle top artists
      if (topArtistsData.status === "fulfilled") {
        setTopArtists(topArtistsData.value.items || [])
      }

      // Handle recent tracks
      if (recentTracksData.status === "fulfilled") {
        setRecentTracks(recentTracksData.value.items?.map((item: any) => item.track) || [])
      }

      // Handle playlists
      if (playlistsData.status === "fulfilled") {
        setPlaylists(playlistsData.value.items || [])
      }

      // Fetch additional data
      await Promise.allSettled([fetchLikedSongs(), fetchFollowedArtists(), fetchRecommendationsData()])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLikedSongs = async () => {
    try {
      const likedData = await fetchSpotifyData("/me/tracks?limit=50")
      setLikedSongs(likedData.items?.map((item: any) => item.track) || [])
    } catch (error) {
      console.error("Error fetching liked songs:", error)
      setLikedSongs([])
    }
  }

  const fetchFollowedArtists = async () => {
    try {
      const followedData = await fetchSpotifyData("/me/following?type=artist&limit=50")
      setFollowedArtists(followedData.artists?.items || [])
    } catch (error) {
      console.error("Error fetching followed artists:", error)
      setFollowedArtists([])
    }
  }

  const fetchRecommendationsData = async () => {
    try {
      // Get seed data for recommendations
      const seedTracks = topTracks.slice(0, 2).map((track) => track.id)
      const seedArtists = topArtists.slice(0, 2).map((artist) => artist.id)
      const seedGenres = ["pop"] // Default genre seed

      if (seedTracks.length > 0 || seedArtists.length > 0) {
        const recommendedTracks = await fetchRecommendations(seedTracks, seedArtists, seedGenres)
        setRecommendations(recommendedTracks)
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      setRecommendations([])
    }
  }

  const searchMusic = async (query: string) => {
    try {
      const data = await fetchSpotifyData(`/search?q=${encodeURIComponent(query)}&type=track,artist&limit=10`)
      setSearchResults(data)
    } catch (error) {
      console.error("Error searching:", error)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "short_term":
        return "Last 4 Weeks"
      case "medium_term":
        return "Last 6 Months"
      case "long_term":
        return "All Time"
    }
  }

  const fetchPlaylistTracks = async (playlistId: string) => {
    try {
      setLoadingPlaylist(true)
      const data = await fetchSpotifyData(`/playlists/${playlistId}/tracks?limit=50`)
      const tracks =
        data.items?.map((item: PlaylistTrack) => item.track).filter((track: Track) => track && track.id) || []
      setPlaylistTracks(tracks)
    } catch (error) {
      console.error("Error fetching playlist tracks:", error)
      setPlaylistTracks([])
    } finally {
      setLoadingPlaylist(false)
    }
  }

  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    fetchPlaylistTracks(playlist.id)
    setActiveTab("playlist")
    setIsMobileMenuOpen(false)
  }

  const handleLikedSongsClick = () => {
    setSelectedPlaylist({
      id: "liked",
      name: "Liked Songs",
      images: [],
      tracks: { total: likedSongs.length },
      description: "Your liked songs",
      owner: { display_name: profile?.display_name || "You" },
      public: false,
    })
    setPlaylistTracks(likedSongs)
    setActiveTab("playlist")
    setIsMobileMenuOpen(false)
  }

  const handleBackToPlaylists = () => {
    setSelectedPlaylist(null)
    setPlaylistTracks([])
    setActiveTab("library")
  }

  const playTrack = (track: Track, queue: Track[] = [], startIndex = 0) => {
    setCurrentTrack(track)
    setCurrentQueue(queue)
    setCurrentTrackIndex(startIndex)
    setIsPlaying(true)
  }

  const playNext = () => {
    if (currentQueue.length > 0 && currentTrackIndex < currentQueue.length - 1) {
      const nextIndex = currentTrackIndex + 1
      setCurrentTrackIndex(nextIndex)
      setCurrentTrack(currentQueue[nextIndex])
      setIsPlaying(true)
    } else if (autoPlay && currentQueue.length > 0) {
      // Loop back to beginning if auto-play is enabled
      setCurrentTrackIndex(0)
      setCurrentTrack(currentQueue[0])
      setIsPlaying(true)
    } else {
      // Stop playing if no more tracks and auto-play is disabled
      setIsPlaying(false)
    }
  }

  const playPrevious = () => {
    if (currentQueue.length > 0 && currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1
      setCurrentTrackIndex(prevIndex)
      setCurrentTrack(currentQueue[prevIndex])
      setIsPlaying(true)
    } else if (autoPlay && currentQueue.length > 0) {
      // Go to last track if at beginning and auto-play is enabled
      const lastIndex = currentQueue.length - 1
      setCurrentTrackIndex(lastIndex)
      setCurrentTrack(currentQueue[lastIndex])
      setIsPlaying(true)
    }
  }

  const handleTrackClick = (track: Track, trackList: Track[], index: number) => {
    playTrack(track, trackList, index)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const getTopGenres = () => {
    if (topArtists.length === 0) return []
    const genreCount: { [key: string]: number } = {}
    topArtists.forEach((artist) => {
      artist.genres.forEach((genre) => {
        genreCount[genre] = (genreCount[genre] || 0) + 1
      })
    })
    return Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre)
  }

  // Show all handlers
  const handleShowAllRecommendations = () => {
    setShowAllRecommendations(!showAllRecommendations)
  }

  const handleShowAllRecentTracks = () => {
    setShowAllRecentTracks(!showAllRecentTracks)
  }

  const handleShowAllTopArtists = () => {
    setShowAllTopArtists(!showAllTopArtists)
  }

  const handleShowAllPlaylists = () => {
    setShowAllPlaylists(!showAllPlaylists)
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-black border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Music className="h-6 w-6 text-white" />
          <h1 className="text-xl font-bold text-white">Groovify</h1>
        </div>
        {profile && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.images[0]?.url || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">{profile.display_name[0]}</AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black z-50 flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Music className="h-6 w-6 text-white" />
              <h1 className="text-xl font-bold text-white">Groovify</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)} className="p-2">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-2 mb-6">
              <Button
                variant={activeTab === "home" ? "secondary" : "ghost"}
                className="w-full justify-start text-gray-300 hover:text-white"
                onClick={() => {
                  setActiveTab("home")
                  setIsMobileMenuOpen(false)
                }}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </Button>
              <Button
                variant={activeTab === "search" ? "secondary" : "ghost"}
                className="w-full justify-start text-gray-300 hover:text-white"
                onClick={() => {
                  setActiveTab("search")
                  setIsMobileMenuOpen(false)
                }}
              >
                <Search className="h-5 w-5 mr-3" />
                Search
              </Button>
              <Button
                variant={activeTab === "library" ? "secondary" : "ghost"}
                className="w-full justify-start text-gray-300 hover:text-white"
                onClick={() => {
                  setActiveTab("library")
                  setIsMobileMenuOpen(false)
                }}
              >
                <Library className="h-5 w-5 mr-3" />
                Your Library
              </Button>
              <Button
                variant={activeTab === "dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start text-gray-300 hover:text-white"
                onClick={() => {
                  setActiveTab("dashboard")
                  setIsMobileMenuOpen(false)
                }}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "wrapped" ? "secondary" : "ghost"}
                className="w-full justify-start text-gray-300 hover:text-white"
                onClick={() => {
                  setActiveTab("wrapped")
                  setIsMobileMenuOpen(false)
                }}
              >
                <Award className="h-5 w-5 mr-3" />
                Your Wrapped
              </Button>
            </nav>

            <div className="space-y-2 mb-6">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white"
                onClick={() => {
                  setActiveTab("create")
                  setIsMobileMenuOpen(false)
                }}
              >
                <Plus className="h-5 w-5 mr-3" />
                Create Playlist
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white"
                onClick={handleLikedSongsClick}
              >
                <Heart className="h-5 w-5 mr-3" />
                Liked Songs
              </Button>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Your Playlists</h3>
              {playlists.slice(0, 10).map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  className="w-full justify-start text-gray-400 hover:text-white text-sm h-8"
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  <span className="truncate">{playlist.name}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-gray-800">
            <Button variant="ghost" onClick={onLogout} className="w-full justify-start text-gray-300 hover:text-white">
              <LogOut className="h-5 w-5 mr-3" />
              Log out
            </Button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-64 bg-black border-r border-gray-800 flex-col">
          {/* Logo */}
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <Music className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Groovify</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-6 space-y-2">
            <Button
              variant={activeTab === "home" ? "secondary" : "ghost"}
              className="w-full justify-start text-gray-300 hover:text-white"
              onClick={() => setActiveTab("home")}
            >
              <Home className="h-5 w-5 mr-3" />
              Home
            </Button>
            <Button
              variant={activeTab === "search" ? "secondary" : "ghost"}
              className="w-full justify-start text-gray-300 hover:text-white"
              onClick={() => setActiveTab("search")}
            >
              <Search className="h-5 w-5 mr-3" />
              Search
            </Button>
            <Button
              variant={activeTab === "library" ? "secondary" : "ghost"}
              className="w-full justify-start text-gray-300 hover:text-white"
              onClick={() => setActiveTab("library")}
            >
              <Library className="h-5 w-5 mr-3" />
              Your Library
            </Button>
            <Button
              variant={activeTab === "dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start text-gray-300 hover:text-white"
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "wrapped" ? "secondary" : "ghost"}
              className="w-full justify-start text-gray-300 hover:text-white"
              onClick={() => setActiveTab("wrapped")}
            >
              <Award className="h-5 w-5 mr-3" />
              Your Wrapped
            </Button>
          </nav>

          {/* Library Actions */}
          <div className="px-6 mt-6 space-y-2">
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
              <Plus className="h-5 w-5 mr-3" />
              Create Playlist
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white"
              onClick={handleLikedSongsClick}
            >
              <Heart className="h-5 w-5 mr-3" />
              Liked Songs
              {likedSongs.length > 0 && (
                <Badge variant="secondary" className="ml-auto bg-green-500/10 text-green-400">
                  {likedSongs.length}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
              <Download className="h-5 w-5 mr-3" />
              Downloaded
            </Button>
          </div>

          {/* Playlists */}
          <div className="flex-1 px-6 mt-6">
            <ScrollArea className="h-full">
              <div className="space-y-1">
                {playlists.slice(0, 15).map((playlist) => (
                  <Button
                    key={playlist.id}
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-white text-sm h-8"
                    onClick={() => handlePlaylistClick(playlist)}
                  >
                    <span className="truncate">{playlist.name}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* User Profile */}
          <div className="p-6 border-t border-gray-800">
            <div className="flex items-center space-x-3">
              {profile && (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.images[0]?.url || "/placeholder.svg"} />
                    <AvatarFallback>{profile.display_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate text-sm">{profile.display_name}</p>
                    <p className="text-xs text-gray-400">{profile.product}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-900 to-black">
          {/* Top Bar */}
          <div className="hidden lg:flex h-16 bg-black/20 backdrop-blur-md border-b border-gray-800 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {activeTab === "search" && (
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="What do you want to listen to?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              {profile && (
                <Button variant="ghost" className="rounded-full bg-black/40 hover:bg-black/60">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={profile.images[0]?.url || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{profile.display_name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{profile.display_name}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {activeTab === "search" && (
            <div className="lg:hidden p-4 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="What do you want to listen to?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Content Area */}
          <ScrollArea className="flex-1">
            <div className="p-4 lg:p-6 pb-32 lg:pb-24">
              {activeTab === "home" && <HomeContent />}
              {activeTab === "search" && <SearchContent />}
              {activeTab === "library" && <LibraryContent />}
              {activeTab === "dashboard" && <DashboardContent />}
              {activeTab === "wrapped" && <WrappedContent />}
              {activeTab === "playlist" && selectedPlaylist && <PlaylistContent />}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Web Player */}
      <WebPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onExpand={() => setShowExpandedPlayer(true)}
        accessToken={accessToken}
        onNext={playNext}
        onPrevious={playPrevious}
      />

      {/* Expanded Player */}
      {showExpandedPlayer && (
        <ExpandedPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onClose={() => setShowExpandedPlayer(false)}
          accessToken={accessToken}
          onNext={playNext}
          onPrevious={playPrevious}
        />
      )}
    </div>
  )

  function HomeContent() {
    return (
      <div className="space-y-6 lg:space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{getGreeting()}</h1>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {recentTracks.slice(0, 6).map((track, index) => (
            <div
              key={`${track.id}-${index}`}
              className="bg-gray-800/50 rounded-lg p-3 lg:p-4 hover:bg-gray-700/50 transition-colors cursor-pointer group flex items-center space-x-3 lg:space-x-4"
              onClick={() => handleTrackClick(track, recentTracks, index)}
            >
              <img
                src={track.album.images[2]?.url || track.album.images[0]?.url}
                alt={track.album.name}
                className="w-12 h-12 lg:w-16 lg:h-16 rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate text-sm lg:text-base">{track.name}</p>
                <p className="text-xs lg:text-sm text-gray-400 truncate">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>
              <Button
                size="sm"
                className="rounded-full bg-green-500 hover:bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {currentTrack?.id === track.id && isPlaying ? (
                  <Pause className="h-3 w-3 lg:h-4 lg:w-4" />
                ) : (
                  <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
                Recommended for you
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white text-sm"
                  onClick={() => recommendations.length > 0 && playTrack(recommendations[0], recommendations, 0)}
                >
                  <Shuffle className="h-4 w-4 mr-1" />
                  Play all
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white text-sm"
                  onClick={handleShowAllRecommendations}
                >
                  {showAllRecommendations ? "Show less" : "Show all"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
              {recommendations.slice(0, showAllRecommendations ? recommendations.length : 10).map((track, index) => (
                <div
                  key={track.id}
                  className="bg-gray-900/50 rounded-lg p-3 lg:p-4 hover:bg-gray-800/50 transition-colors cursor-pointer group"
                  onClick={() => handleTrackClick(track, recommendations, index)}
                >
                  <div className="relative mb-3 lg:mb-4">
                    <img
                      src={track.album.images[1]?.url || track.album.images[0]?.url}
                      alt={track.album.name}
                      className="w-full aspect-square rounded-lg"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 rounded-full bg-green-500 hover:bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium text-white truncate mb-1 text-sm lg:text-base">{track.name}</h3>
                  <p className="text-xs lg:text-sm text-gray-400 truncate">
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </p>
                  <div className="mt-2">
                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 text-xs">
                      {track.popularity}% match
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Made For You */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl lg:text-2xl font-bold text-white">Made for you</h2>
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white text-sm"
              onClick={handleShowAllRecommendations}
            >
              {showAllRecommendations ? "Show less" : "Show all"}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
            {recommendations.slice(10, showAllRecommendations ? 20 : 15).map((track, index) => (
              <div
                key={track.id}
                className="bg-gray-900/50 rounded-lg p-3 lg:p-4 hover:bg-gray-800/50 transition-colors cursor-pointer group"
                onClick={() => handleTrackClick(track, recommendations, index + 10)}
              >
                <div className="relative mb-3 lg:mb-4">
                  <img
                    src={track.album.images[1]?.url || track.album.images[0]?.url}
                    alt={track.album.name}
                    className="w-full aspect-square rounded-lg"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 rounded-full bg-green-500 hover:bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </div>
                <h3 className="font-medium text-white truncate mb-1 text-sm lg:text-base">{track.name}</h3>
                <p className="text-xs lg:text-sm text-gray-400 truncate">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Played */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl lg:text-2xl font-bold text-white">Recently played</h2>
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white text-sm"
              onClick={handleShowAllRecentTracks}
            >
              {showAllRecentTracks ? "Show less" : "Show all"}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
            {recentTracks.slice(0, showAllRecentTracks ? recentTracks.length : 5).map((track, index) => (
              <div
                key={`recent-${track.id}-${index}`}
                className="bg-gray-900/50 rounded-lg p-3 lg:p-4 hover:bg-gray-800/50 transition-colors cursor-pointer group"
                onClick={() => handleTrackClick(track, recentTracks, index)}
              >
                <div className="relative mb-3 lg:mb-4">
                  <img
                    src={track.album.images[1]?.url || track.album.images[0]?.url}
                    alt={track.album.name}
                    className="w-full aspect-square rounded-lg"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 rounded-full bg-green-500 hover:bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </div>
                <h3 className="font-medium text-white truncate mb-1 text-sm lg:text-base">{track.name}</h3>
                <p className="text-xs lg:text-sm text-gray-400 truncate">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Your Top Artists */}
        {followedArtists.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl lg:text-2xl font-bold text-white">Your top artists</h2>
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white text-sm"
                onClick={handleShowAllTopArtists}
              >
                {showAllTopArtists ? "Show less" : "Show all"}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
              {followedArtists.slice(0, showAllTopArtists ? followedArtists.length : 5).map((artist) => (
                <div
                  key={artist.id}
                  className="bg-gray-900/50 rounded-lg p-3 lg:p-4 hover:bg-gray-800/50 transition-colors cursor-pointer group"
                >
                  <div className="relative mb-3 lg:mb-4">
                    <img
                      src={artist.images[1]?.url || artist.images[0]?.url || "/placeholder.svg?height=160&width=160"}
                      alt={artist.name}
                      className="w-full aspect-square rounded-full"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 rounded-full bg-green-500 hover:bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium text-white truncate mb-1 text-sm lg:text-base">{artist.name}</h3>
                  <p className="text-xs lg:text-sm text-gray-400">Artist</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Music Capsule */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl lg:text-2xl font-bold text-white">Your music capsule</h2>
            <Button variant="ghost" className="text-gray-400 hover:text-white text-sm">
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-purple-600 to-blue-600 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Sparkles className="h-12 w-12" />
                  <div>
                    <h3 className="text-xl font-bold">Top Genres</h3>
                    <p className="text-sm opacity-90">Your favorite sounds</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getTopGenres()
                        .slice(0, 3)
                        .map((genre) => (
                          <Badge key={genre} variant="secondary" className="bg-white/20 text-white">
                            {genre}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-teal-600 border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-12 w-12" />
                  <div>
                    <h3 className="text-xl font-bold">Following</h3>
                    <p className="text-sm opacity-90">Artists you follow</p>
                    <p className="text-2xl font-bold mt-1">{followedArtists.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  function SearchContent() {
    if (!searchQuery && !searchResults) {
      return (
        <div className="space-y-6 lg:space-y-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-6">Browse all</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {[
                { name: "Pop", color: "bg-pink-500" },
                { name: "Hip-Hop", color: "bg-orange-500" },
                { name: "Rock", color: "bg-red-500" },
                { name: "Jazz", color: "bg-blue-500" },
                { name: "Electronic", color: "bg-purple-500" },
                { name: "Country", color: "bg-yellow-500" },
                { name: "R&B", color: "bg-green-500" },
                { name: "Indie", color: "bg-indigo-500" },
              ].map((genre) => (
                <div
                  key={genre.name}
                  className={`${genre.color} rounded-lg p-4 lg:p-6 cursor-pointer hover:scale-105 transition-transform`}
                >
                  <h3 className="text-lg lg:text-2xl font-bold text-white">{genre.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6 lg:space-y-8">
        {searchResults && (
          <>
            {/* Top Result */}
            {searchResults.tracks.items.length > 0 && (
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-4">Top result</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div
                    className="bg-gray-800/50 rounded-lg p-4 lg:p-6 hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    onClick={() => handleTrackClick(searchResults.tracks.items[0], searchResults.tracks.items, 0)}
                  >
                    <img
                      src={
                        searchResults.tracks.items[0].album.images[1]?.url ||
                        searchResults.tracks.items[0].album.images[0]?.url ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={searchResults.tracks.items[0].album.name}
                      className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg mb-4"
                    />
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                      {searchResults.tracks.items[0].name}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Song • {searchResults.tracks.items[0].artists.map((artist) => artist.name).join(", ")}
                    </p>
                    <Button
                      size="sm"
                      className="rounded-full bg-green-500 hover:bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Songs */}
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-white mb-4">Songs</h3>
                    <div className="space-y-2">
                      {searchResults.tracks.items.slice(1, 5).map((track, index) => (
                        <div
                          key={track.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group"
                          onClick={() => handleTrackClick(track, searchResults.tracks.items, index + 1)}
                        >
                          <img
                            src={track.album.images[2]?.url || track.album.images[0]?.url}
                            alt={track.album.name}
                            className="w-10 h-10 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate text-sm lg:text-base">{track.name}</p>
                            <p className="text-xs lg:text-sm text-gray-400 truncate">
                              {track.artists.map((artist) => artist.name).join(", ")}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Artists */}
            {searchResults.artists.items.length > 0 && (
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-4">Artists</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
                  {searchResults.artists.items.slice(0, 5).map((artist) => (
                    <div
                      key={artist.id}
                      className="bg-gray-900/50 rounded-lg p-3 lg:p-4 hover:bg-gray-800/50 transition-colors cursor-pointer group"
                    >
                      <div className="relative mb-3 lg:mb-4">
                        <img
                          src={
                            artist.images[1]?.url || artist.images[0]?.url || "/placeholder.svg?height=160&width=160"
                          }
                          alt={artist.name}
                          className="w-full aspect-square rounded-full"
                        />
                        <Button
                          size="sm"
                          className="absolute bottom-2 right-2 rounded-full bg-green-500 hover:bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                        </Button>
                      </div>
                      <h3 className="font-medium text-white truncate mb-1 text-sm lg:text-base">{artist.name}</h3>
                      <p className="text-xs lg:text-sm text-gray-400">Artist</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  function LibraryContent() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Your Library</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden lg:flex">
              Recently Added
            </Button>
          </div>
        </div>

        {/* Liked Songs */}
        {likedSongs.length > 0 && (
          <div
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group"
            onClick={handleLikedSongsClick}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-700 to-blue-300 rounded flex items-center justify-center">
              <Heart className="h-8 w-8 text-white fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white">Liked Songs</h3>
              <p className="text-sm text-gray-400">{likedSongs.length} liked songs</p>
            </div>
            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {playlists.slice(0, showAllPlaylists ? playlists.length : 10).map((playlist) => (
            <div
              key={playlist.id}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group"
              onClick={() => handlePlaylistClick(playlist)}
            >
              <img
                src={playlist.images[0]?.url || "/placeholder.svg?height=64&width=64"}
                alt={playlist.name}
                className="w-16 h-16 rounded"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{playlist.name}</h3>
                <p className="text-sm text-gray-400">
                  Playlist • {playlist.owner.display_name} • {playlist.tracks.total} songs
                </p>
              </div>
              <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {playlists.length > 10 && (
          <div className="text-center">
            <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={handleShowAllPlaylists}>
              {showAllPlaylists ? "Show less" : `Show all ${playlists.length} playlists`}
            </Button>
          </div>
        )}
      </div>
    )
  }

  function DashboardContent() {
    return (
      <div className="space-y-6 lg:space-y-8">
        {/* Time Range Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Your Dashboard</h1>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="short_term" className="text-xs lg:text-sm">
                4 Weeks
              </TabsTrigger>
              <TabsTrigger value="medium_term" className="text-xs lg:text-sm">
                6 Months
              </TabsTrigger>
              <TabsTrigger value="long_term" className="text-xs lg:text-sm">
                All Time
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-xl lg:text-2xl font-bold text-green-500">{topTracks.length}</h3>
                <p className="text-xs lg:text-sm text-gray-400">Top Tracks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-xl lg:text-2xl font-bold text-blue-500">{topArtists.length}</h3>
                <p className="text-xs lg:text-sm text-gray-400">Top Artists</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-xl lg:text-2xl font-bold text-purple-500">{playlists.length}</h3>
                <p className="text-xs lg:text-sm text-gray-400">Playlists</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-xl lg:text-2xl font-bold text-yellow-500">{followedArtists.length}</h3>
                <p className="text-xs lg:text-sm text-gray-400">Following</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Charts Placeholder */}
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Top Tracks Popularity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTracks.slice(0, 5).map((track, index) => (
                  <div key={track.id} className="flex items-center space-x-3">
                    <div className="text-sm font-bold text-gray-400 w-6">{index + 1}</div>
                    <img
                      src={track.album.images[2]?.url || track.album.images[0]?.url}
                      alt={track.album.name}
                      className="w-10 h-10 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-sm">{track.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </p>
                    </div>
                    <div className="w-24 bg-gray-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${track.popularity}%` }} />
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-green-500/10 text-green-400 text-xs">
                        {track.popularity}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Top Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTopGenres().map((genre, index) => (
                    <div key={genre} className="flex items-center justify-between">
                      <span className="text-white">{genre}</span>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Music Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Tracks</span>
                    <span className="text-white font-medium">{topTracks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Artists</span>
                    <span className="text-white font-medium">{topArtists.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Playlists</span>
                    <span className="text-white font-medium">{playlists.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Following</span>
                    <span className="text-white font-medium">{followedArtists.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Tracks List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Your Top Tracks - {getTimeRangeLabel()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => topTracks.length > 0 && playTrack(topTracks[0], topTracks, 0)}
                disabled={topTracks.length === 0}
              >
                <Play className="h-3 w-3 mr-1" />
                Play All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topTracks.slice(0, 10).map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => handleTrackClick(track, topTracks, index)}
                >
                  <div className="text-sm font-bold text-gray-400 w-6">{index + 1}</div>
                  <img
                    src={track.album.images[2]?.url || track.album.images[0]?.url}
                    alt={track.album.name}
                    className="w-10 h-10 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate text-sm">{track.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 text-xs">
                      {track.popularity}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function WrappedContent() {
    const currentYear = new Date().getFullYear()

    return (
      <div className="space-y-6 lg:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Your {currentYear} Wrapped</h1>
          <p className="text-gray-400">Your year in music</p>
        </div>

        {/* Wrapped Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <Card className="bg-gradient-to-br from-green-600 to-green-400 border-0 text-white">
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{topTracks.length}</h3>
              <p className="text-sm opacity-90">Different songs played</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 text-white">
            <CardContent className="p-6 text-center">
              <Music className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{playlists.length}</h3>
              <p className="text-sm opacity-90">Playlists created</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 border-0 text-white">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{topArtists.length}</h3>
              <p className="text-sm opacity-90">Different artists</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Song */}
        {topTracks.length > 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Your #1 Song This Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group"
                onClick={() => handleTrackClick(topTracks[0], topTracks, 0)}
              >
                <img
                  src={topTracks[0].album.images[1]?.url || topTracks[0].album.images[0]?.url}
                  alt={topTracks[0].album.name}
                  className="w-20 h-20 rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{topTracks[0].name}</h3>
                  <p className="text-gray-400 mb-2">{topTracks[0].artists.map((artist) => artist.name).join(", ")}</p>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                    {topTracks[0].popularity}% Popular
                  </Badge>
                </div>
                <Button
                  size="lg"
                  className="rounded-full bg-green-500 hover:bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Artist */}
        {topArtists.length > 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Your #1 Artist This Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                <img
                  src={
                    topArtists[0].images[1]?.url ||
                    topArtists[0].images[0]?.url ||
                    "/placeholder.svg?height=80&width=80" ||
                    "/placeholder.svg"
                  }
                  alt={topArtists[0].name}
                  className="w-20 h-20 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{topArtists[0].name}</h3>
                  <p className="text-gray-400 mb-2">{topArtists[0].followers.total.toLocaleString()} followers</p>
                  <div className="flex flex-wrap gap-2">
                    {topArtists[0].genres.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Genres */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Top Genres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {getTopGenres().map((genre, index) => (
                <div
                  key={genre}
                  className="bg-gray-800/50 rounded-lg p-4 text-center hover:bg-gray-800 transition-colors"
                >
                  <div className="text-2xl font-bold text-green-500 mb-1">#{index + 1}</div>
                  <p className="text-white font-medium text-sm">{genre}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function PlaylistContent() {
    if (!selectedPlaylist) return null

    const isLikedSongs = selectedPlaylist.id === "liked"

    return (
      <div className="space-y-6">
        {/* Playlist Header */}
        <div className="flex flex-col lg:flex-row lg:items-end space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="w-48 h-48 lg:w-58 lg:h-58 mx-auto lg:mx-0">
            {isLikedSongs ? (
              <div className="w-full h-full bg-gradient-to-br from-purple-700 to-blue-300 rounded-lg flex items-center justify-center">
                <Heart className="h-20 w-20 text-white fill-white" />
              </div>
            ) : (
              <img
                src={selectedPlaylist.images[0]?.url || "/placeholder.svg?height=232&width=232"}
                alt={selectedPlaylist.name}
                className="w-full h-full rounded-lg shadow-2xl"
              />
            )}
          </div>
          <div className="flex-1 text-center lg:text-left">
            <p className="text-sm font-medium text-white mb-2">PLAYLIST</p>
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">{selectedPlaylist.name}</h1>
            <p className="text-gray-400 mb-4">{selectedPlaylist.description}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span className="font-medium text-white">{selectedPlaylist.owner.display_name}</span>
              <span>•</span>
              <span>{playlistTracks.length} songs</span>
            </div>
          </div>
        </div>

        {/* Playlist Controls */}
        <div className="flex items-center space-x-6">
          <Button
            size="lg"
            className="rounded-full bg-green-500 hover:bg-green-400 w-14 h-14"
            onClick={() => playlistTracks.length > 0 && playTrack(playlistTracks[0], playlistTracks, 0)}
          >
            <Play className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="lg" className="rounded-full">
            <Heart className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="lg" className="rounded-full">
            <Download className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="lg" className="rounded-full lg:hidden" onClick={handleBackToPlaylists}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        {/* Track List */}
        <div className="space-y-1">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
            <div className="col-span-1">#</div>
            <div className="col-span-6">TITLE</div>
            <div className="col-span-3">ALBUM</div>
            <div className="col-span-2 text-right">
              <Clock className="h-4 w-4 ml-auto" />
            </div>
          </div>

          {loadingPlaylist ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading tracks...</div>
            </div>
          ) : (
            playlistTracks.map((track, index) => (
              <div
                key={`${track.id}-${index}`}
                className="grid grid-cols-12 gap-4 px-4 py-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group"
                onClick={() => handleTrackClick(track, playlistTracks, index)}
              >
                <div className="col-span-1 flex items-center">
                  <span className="text-gray-400 group-hover:hidden text-sm lg:text-base">{index + 1}</span>
                  <Play className="h-4 w-4 text-white hidden group-hover:block" />
                </div>
                <div className="col-span-8 lg:col-span-6 flex items-center space-x-3">
                  <img
                    src={track.album.images[2]?.url || track.album.images[0]?.url}
                    alt={track.album.name}
                    className="w-10 h-10 rounded"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate text-sm lg:text-base">{track.name}</p>
                    <p className="text-xs lg:text-sm text-gray-400 truncate">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="hidden lg:flex lg:col-span-3 items-center">
                  <p className="text-gray-400 truncate text-sm">{track.album.name}</p>
                </div>
                <div className="col-span-3 lg:col-span-2 flex items-center justify-end">
                  <p className="text-gray-400 text-sm">{formatDuration(track.duration_ms)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }
}
