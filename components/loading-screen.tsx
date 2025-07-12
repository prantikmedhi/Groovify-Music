"use client"

import { Music } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Music className="h-12 w-12 text-green-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white">Loading Groovify...</h2>
        <p className="text-gray-400 text-sm">Getting your music ready</p>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  )
}
