"use client"

import { useEffect, useState } from "react"
import { SpotifyAuth } from "@/components/spotify-auth"
import { Dashboard } from "@/components/dashboard"
import { LoadingScreen } from "@/components/loading-screen"

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem("groovify_access_token")
    const expiry = localStorage.getItem("groovify_token_expiry")

    if (token && expiry && new Date().getTime() < Number.parseInt(expiry)) {
      setAccessToken(token)
    }

    setLoading(false)
  }, [])

  const handleAuthSuccess = (token: string, expiresIn: number) => {
    const expiryTime = new Date().getTime() + expiresIn * 1000
    localStorage.setItem("groovify_access_token", token)
    localStorage.setItem("groovify_token_expiry", expiryTime.toString())
    setAccessToken(token)
  }

  const handleLogout = () => {
    localStorage.removeItem("groovify_access_token")
    localStorage.removeItem("groovify_token_expiry")
    localStorage.removeItem("groovify_code_verifier")
    setAccessToken(null)
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!accessToken) {
    return <SpotifyAuth onAuthSuccess={handleAuthSuccess} />
  }

  return <Dashboard accessToken={accessToken} onLogout={handleLogout} />
}
