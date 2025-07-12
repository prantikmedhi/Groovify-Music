"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Play, Search, Heart, List } from "lucide-react"

const CLIENT_ID = "b8b0c4a4f4194296b2186fd4a814bef2" // Replace with your Spotify Client ID
const REDIRECT_URI = typeof window !== "undefined" ? window.location.origin : ""
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
  "user-library-read",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
].join(" ")

interface SpotifyAuthProps {
  onAuthSuccess: (token: string, expiresIn: number) => void
}

export function SpotifyAuth({ onAuthSuccess }: SpotifyAuthProps) {
  useEffect(() => {
    // Check for authorization code in URL
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")

    if (code) {
      exchangeCodeForToken(code)
    }
  }, [])

  const generateCodeVerifier = (length: number) => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const values = crypto.getRandomValues(new Uint8Array(length))
    return values.reduce((acc, x) => acc + possible[x % possible.length], "")
  }

  const generateCodeChallenge = async (verifier: string) => {
    const data = new TextEncoder().encode(verifier)
    const digest = await crypto.subtle.digest("SHA-256", data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
  }

  const redirectToSpotifyAuth = async () => {
    const codeVerifier = generateCodeVerifier(128)
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    localStorage.setItem("groovify_code_verifier", codeVerifier)

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
  }

  const exchangeCodeForToken = async (code: string) => {
    const codeVerifier = localStorage.getItem("groovify_code_verifier")

    if (!codeVerifier) {
      console.error("Code verifier not found")
      return
    }

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      })

      const data = await response.json()

      if (data.access_token) {
        onAuthSuccess(data.access_token, data.expires_in)
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-green-500/10 rounded-full">
              <Music className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">Groovify</h1>
          <p className="text-gray-400 text-base">Your personal music companion</p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white text-xl">Connect Spotify</CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Stream music and discover your listening patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center space-y-2">
                <Play className="h-6 w-6 text-green-500 mx-auto" />
                <p className="text-xs text-gray-400">Stream Music</p>
              </div>
              <div className="text-center space-y-2">
                <Search className="h-6 w-6 text-green-500 mx-auto" />
                <p className="text-xs text-gray-400">Discover</p>
              </div>
              <div className="text-center space-y-2">
                <Heart className="h-6 w-6 text-green-500 mx-auto" />
                <p className="text-xs text-gray-400">Your Favorites</p>
              </div>
              <div className="text-center space-y-2">
                <List className="h-6 w-6 text-green-500 mx-auto" />
                <p className="text-xs text-gray-400">Playlists</p>
              </div>
            </div>

            <Button
              onClick={redirectToSpotifyAuth}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 text-sm"
            >
              Connect with Spotify
            </Button>

            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Requires Spotify Premium for playback. We don't store your data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
