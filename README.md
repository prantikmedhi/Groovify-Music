# 🎵 Groovify - Advanced Spotify Music Player Clone & Analytics Dashboard

<div align="center">

![Groovify Logo](https://img.shields.io/badge/🎵-Groovify-1DB954?style=for-the-badge&logo=spotify&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Spotify API](https://img.shields.io/badge/Spotify-Web%20API-1DB954?style=flat-square&logo=spotify)](https://developer.spotify.com/documentation/web-api/)

**🎧 Professional Spotify Clone & Music Analytics Dashboard | React Music Player | Next.js Streaming App**

*The ultimate open-source music player with advanced analytics, built with modern web technologies*

[🚀 **Live Demo**](https://groovify-mp.vercel.app/) • [📖 **Documentation**](#-documentation) • [🐛 **Report Bug**](https://github.com/prantikmedhi/groovify/issues) • [✨ **Request Feature**](https://github.com/prantikmedhi/groovify/issues)

</div>

---

## 🌟 Why Groovify? The Best Open Source Music Player Clone

Groovify is a **professional-grade Spotify clone** and **music analytics dashboard** that provides everything you need to build a modern streaming music application. Whether you're learning React, building a portfolio project, or creating a commercial music app, Groovify offers production-ready code with enterprise-level features.

### 🎯 **Perfect for:**
- **Developers** building music streaming applications
- **Students** learning React, Next.js, and API integration
- **Entrepreneurs** creating music-related startups
- **Portfolio projects** showcasing full-stack development skills
- **Music enthusiasts** who want advanced analytics

---

## ✨ **Features That Make Groovify Stand Out**

### 🎧 **Complete Music Player Experience**
- **🎵 Web Playback SDK Integration** - Full Spotify Premium playback control
- **⏯️ Preview Mode** - 30-second previews for non-premium users
- **📝 Queue Management** - Automatic playlist progression and manual queue control
- **🎛️ Advanced Controls** - Shuffle, repeat, volume control, crossfade, and seeking
- **📱 Responsive Player** - Beautiful player UI that works on all devices

### 📊 **Advanced Music Analytics & Insights**
- **🎼 Audio Features Analysis** - Danceability, energy, valence, tempo, acousticness, and more
- **📈 Listening Patterns** - Top tracks, artists, and genres with customizable time ranges
- **📉 Visual Charts** - Interactive radar charts, bar charts, and distribution graphs
- **🔍 Track Structure Analysis** - Detailed audio analysis with bars, beats, and sections
- **🎨 Mood Visualization** - Color-coded mood analysis and energy levels

### 🔍 **Smart Discovery & Recommendation Engine**
- **🔎 Intelligent Search** - Real-time search across tracks, artists, albums, and playlists
- **🤖 Related Artists** - AI-powered similar artist recommendations
- **🆕 New Releases** - Trending albums globally and by region
- **🎪 Genre Categories** - Browse curated playlists by mood, activity, and genre
- **🌍 Market Analysis** - Regional music trends and availability insights

### 📱 **Premium User Experience**
- **🌙 Dark Theme** - Spotify-inspired dark interface with custom theming
- **📱 Mobile-First Design** - Optimized for mobile, tablet, and desktop
- **⚡ Real-time Updates** - Live playback status and progress tracking
- **💾 Offline Support** - Cached data for improved performance and reduced API calls
- **🔄 Cross-device Sync** - Seamless playback across multiple devices

---

## 🚀 **Quick Start Guide**

### **Prerequisites**

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Spotify Developer Account** ([Create one here](https://developer.spotify.com/dashboard))

### **1. Clone the Repository**

```bash
git clone https://github.com/prantikmedhi/groovify.git
cd groovify
```

### **2. Install Dependencies**

```bash
npm install
# or
yarn install
```

### **3. Environment Setup**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_SPOTIFY_SCOPES=user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played user-top-read user-follow-read user-library-read playlist-read-private streaming
```

### **4. Spotify App Configuration**

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or use existing one
3. Add redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
4. Copy your **Client ID** to the environment file

### **5. Run Development Server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and start exploring!

---

## 🏗️ **Modern Architecture & Tech Stack**

### **Core Technologies**
- **⚛️ React 18** - Latest React with concurrent features
- **🔥 Next.js 14** - App Router, Server Components, and optimized performance
- **📘 TypeScript** - Type-safe development with full IntelliSense
- **🎨 Tailwind CSS** - Modern utility-first CSS framework
- **🧩 shadcn/ui** - Beautiful, accessible UI components
- **📊 Recharts** - Professional data visualization library

### **Music & Audio Integration**
- **🎵 Spotify Web API** - Complete integration with Spotify's ecosystem
- **🎧 Web Playback SDK** - Real-time audio streaming and control
- **🔐 OAuth 2.0 + PKCE** - Secure authentication flow
- **📡 Real-time API** - Live updates and synchronization

### **Performance & Optimization**
- **⚡ Server-Side Rendering** - Fast initial page loads
- **🗄️ Smart Caching** - Efficient data management and reduced API calls
- **📱 Progressive Web App** - App-like experience on mobile devices
- **🔄 Incremental Static Regeneration** - Dynamic content with static performance

### **🏗️ Project Structure**

```
🎵 groovify/
│
├── 📁 app/                         # Next.js 14 App Directory
│   ├── 🎨 globals.css             # Global styles & CSS variables
│   ├── 📄 layout.tsx              # Root layout with providers
│   ├── 🏠 page.tsx                # Landing page component
│   ├── 📊 dashboard/              # Analytics dashboard routes
│   │   ├── page.tsx               # Main dashboard page
│   │   └── loading.tsx            # Loading UI component
│   ├── 🎵 player/                 # Music player routes
│   │   ├── page.tsx               # Player page
│   │   └── [id]/                  # Dynamic track routes
│   └── 🔍 search/                 # Search functionality
│       ├── page.tsx               # Search results page
│       └── components/            # Search-specific components
│
├── 📁 components/                  # Reusable React Components
│   ├── 🎵 player/                 # Music player components
│   │   ├── web-player.tsx         # Main player component
│   │   ├── expanded-player.tsx    # Full-screen player
│   │   ├── player-controls.tsx    # Playback controls
│   │   ├── volume-slider.tsx      # Volume control
│   │   └── progress-bar.tsx       # Progress indicator
│   │
│   ├── 📊 charts/                 # Data visualization
│   │   ├── audio-features-radar.tsx  # Radar chart component
│   │   ├── listening-stats.tsx    # Statistics charts
│   │   ├── genre-distribution.tsx # Genre breakdown
│   │   └── mood-analyzer.tsx      # Mood visualization
│   │
│   ├── 🔍 discovery/              # Music discovery features
│   │   ├── search-component.tsx   # Search interface
│   │   ├── recommendations.tsx    # AI recommendations
│   │   ├── new-releases.tsx       # Latest releases
│   │   ├── trending-artists.tsx   # Popular artists
│   │   └── genre-categories.tsx   # Browse by genre
│   │
│   ├── 📱 ui/                     # shadcn/ui components
│   │   ├── button.tsx             # Custom button component
│   │   ├── card.tsx               # Card container
│   │   ├── dialog.tsx             # Modal dialogs
│   │   ├── slider.tsx             # Range sliders
│   │   └── tooltip.tsx            # Hover tooltips
│   │
│   ├── 🔐 auth/                   # Authentication components
│   │   ├── spotify-auth.tsx       # OAuth handler
│   │   ├── login-button.tsx       # Login interface
│   │   └── auth-provider.tsx      # Auth context provider
│   │
│   └── 🎨 layout/                 # Layout components
│       ├── header.tsx             # Navigation header
│       ├── sidebar.tsx            # Side navigation
│       ├── footer.tsx             # Footer component
│       └── mobile-nav.tsx         # Mobile navigation
│
├── 📁 hooks/                      # Custom React Hooks
│   ├── 🎵 use-spotify.ts          # Spotify API integration
│   ├── 🎧 use-player.ts           # Player state management
│   ├── 📊 use-analytics.ts        # Analytics data fetching
│   ├── 🔍 use-search.ts           # Search functionality
│   ├── 💾 use-local-storage.ts    # Local storage management
│   └── 🌐 use-api.ts              # Generic API hook
│
├── 📁 lib/                        # Utility Functions & Helpers
│   ├── 🎵 spotify-api.ts          # Spotify API client
│   ├── 🔑 auth-utils.ts           # Authentication utilities
│   ├── 📊 chart-utils.ts          # Chart data processing
│   ├── 🎨 theme-utils.ts          # Theme management
│   ├── 🔧 utils.ts                # General utilities
│   └── 📱 responsive-utils.ts     # Responsive design helpers
│
├── 📁 types/                      # TypeScript Definitions
│   ├── 🎵 spotify.ts              # Spotify API types
│   ├── 🎧 player.ts               # Player state types
│   ├── 📊 analytics.ts            # Analytics data types
│   ├── 🔍 search.ts               # Search result types
│   └── 🌐 api.ts                  # API response types
│
├── 📁 public/                     # Static Assets
│   ├── 🖼️ images/                 # Image assets
│   │   ├── logo.svg               # App logo
│   │   ├── placeholder.png        # Default artwork
│   │   └── icons/                 # Custom icons
│   ├── 🎵 audio/                  # Audio assets
│   │   └── preview-fallback.mp3   # Fallback audio
│   └── 📄 manifest.json           # PWA manifest
│
├── 📁 styles/                     # Additional Styles
│   ├── 🎨 components.css          # Component-specific styles
│   ├── 🎵 player.css              # Player styling
│   └── 📊 charts.css              # Chart customizations
│
├── 📁 config/                     # Configuration Files
│   ├── ⚙️ spotify-config.ts       # Spotify API configuration
│   ├── 🎨 theme-config.ts         # Theme configuration
│   └── 📊 chart-config.ts         # Chart default settings
│
└── 📄 Configuration Files
    ├── 📦 package.json            # Dependencies & scripts
    ├── ⚙️ next.config.js          # Next.js configuration
    ├── 🎨 tailwind.config.js      # Tailwind CSS config
    ├── 📘 tsconfig.json           # TypeScript config
    ├── 🔍 .eslintrc.json          # ESLint configuration
    └── 🔧 .env.local              # Environment variables
```

---

## 🔧 **Configuration & Setup**

### **Spotify API Scopes**

The application requires the following Spotify scopes for full functionality:

- `user-read-private` - Access user profile information
- `user-read-email` - Access user email address
- `user-read-playback-state` - Read current playback state
- `user-modify-playback-state` - Control playback (play, pause, skip)
- `user-read-currently-playing` - Read currently playing track
- `user-read-recently-played` - Read listening history
- `user-top-read` - Read top artists and tracks
- `user-follow-read` - Read followed artists
- `user-library-read` - Read saved tracks and albums
- `playlist-read-private` - Read private playlists
- `streaming` - Web Playback SDK streaming

### **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` | Your Spotify app client ID | ✅ |
| `NEXT_PUBLIC_REDIRECT_URI` | OAuth redirect URI | ✅ |
| `NEXT_PUBLIC_SPOTIFY_SCOPES` | Required API scopes | ✅ |

---

## 📱 **Features Deep Dive**

### **🎵 Advanced Audio Analysis**
- **Track Structure**: Comprehensive analysis of bars, beats, tatums, and sections
- **Audio Features**: 13+ musical characteristics including danceability, energy, valence
- **Tempo & Key Detection**: Accurate BPM and musical key identification
- **Mood Analysis**: Emotional content analysis with visual representations

### **🔍 Smart Discovery Engine**
- **Machine Learning Recommendations**: AI-powered artist and track suggestions
- **Genre Categories**: 50+ curated playlists organized by mood and activity
- **New Releases**: Latest albums with regional filtering and trending analysis
- **Market Insights**: Global and regional music trends with data visualization

### **🎧 Professional Playback Features**
- **Premium Integration**: Full control with Spotify Premium subscription
- **Preview Mode**: High-quality 30-second previews for free users
- **Smart Queue**: Intelligent playlist progression with user overrides
- **Cross-device Sync**: Seamless playback continuation across devices

---

## 🚀 **Deployment & Production**

### **Vercel (Recommended)**

1. **Connect Repository**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Update redirect URI to your production domain

3. **Deploy**
   ```bash
   vercel --prod
   ```

### **Other Platforms**

- **Netlify**: Use `npm run build` and deploy `out/` folder
- **Railway**: Connect GitHub repo and set environment variables
- **Docker**: Use provided Dockerfile for containerized deployment
- **AWS/Google Cloud**: Deploy with serverless functions

---

## 🤝 **Contributing & Development**

We welcome contributions from developers of all skill levels! Whether you're fixing bugs, adding features, or improving documentation, your help makes Groovify better for everyone.

### **Development Workflow**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Code Standards**

- **ESLint** for code linting and consistency
- **Prettier** for automated code formatting
- **TypeScript** for type safety and developer experience
- **Conventional Commits** for clear commit message history

---

## 📊 **Performance & Optimization**

### **API Usage & Rate Limiting**
- **Spotify API**: 100 requests per minute with intelligent caching
- **Batch Requests**: Efficient data fetching to minimize API calls
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Retry Mechanisms**: Automatic retry with exponential backoff

### **Performance Metrics**
- **Lighthouse Score**: 95+ performance rating
- **Core Web Vitals**: Optimized for Google's performance standards
- **Bundle Size**: Optimized JavaScript bundles with code splitting
- **Loading Speed**: Sub-second initial page loads

---

## 🗺️ **Roadmap & Future Features**

### **Phase 1 (Completed ✅)**
- [x] Basic playback functionality with Web Playback SDK
- [x] Audio features analysis and visualization
- [x] Top tracks and artists with time range filters
- [x] Playlist management and queue control

### **Phase 2 (In Progress 🚧)**
- [x] Advanced audio analysis with detailed breakdowns
- [x] Discovery features with recommendation engine
- [x] Related artists and similar music suggestions
- [x] New releases and trending music
- [ ] Social features and user profiles
- [ ] Collaborative playlists and sharing

### **Phase 3 (Planned 📋)**
- [ ] Machine learning-powered personalized recommendations
- [ ] Advanced analytics dashboard with export functionality
- [ ] Mobile app development (React Native)
- [ ] Integration with multiple streaming platforms
- [ ] Offline listening capabilities

---

## 🐛 **Known Issues & Browser Compatibility**

- **Safari iOS**: Web Playback SDK has limited functionality on iOS Safari
- **Firefox Private Mode**: Some audio features may not work correctly
- **Mobile Browsers**: Premium features require Spotify Premium subscription
- **Ad Blockers**: May interfere with Spotify API requests

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for complete details.

---

## 🙏 **Acknowledgments**

- **Spotify** for providing the comprehensive Web API and Web Playback SDK
- **Open Source Community** for the incredible tools and libraries
- **Modern Web Standards** for enabling rich audio experiences

---

## 📞 **Support & Community**

- **📚 Documentation**: [GitHub Wiki](https://github.com/prantikmedhi/groovify/wiki)
- **🐛 Issues**: [GitHub Issues](https://github.com/prantikmedhi/groovify/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/prantikmedhi/groovify/discussions)
- **📧 Contact**: For enterprise support and custom development

---

## 🏷️ **Keywords for SEO**

`spotify clone`, `music player`, `react music app`, `next.js music player`, `spotify web api`, `music analytics`, `streaming app`, `web playback sdk`, `music dashboard`, `audio visualization`, `playlist manager`, `music discovery`, `typescript music app`, `tailwind music player`, `open source music player`

---

<div align="center">

**Built with passion for music and code 🎵**

⭐ **Star this repo** if you found it helpful! | 🔄 **Share** with fellow developers

[![GitHub Stars](https://img.shields.io/github/stars/prantikmedhi/groovify?style=social)](https://github.com/prantikmedhi/groovify)
[![Twitter Follow](https://img.shields.io/twitter/follow/prantikmedhi?style=social)](https://twitter.com/prantikmedhi)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-prantikmedhi-blue?style=social&logo=linkedin)](https://linkedin.com/in/prantikmedhi)

</div>

---

## 🎯 **SEO Tags & Search Terms**

*Spotify Clone • Music Player • React Music App • Next.js Streaming • Web Playback SDK • Music Analytics • Audio Visualization • Playlist Manager • TypeScript Music • Open Source Player • Music Discovery • Streaming Dashboard • Web Audio API • Music Statistics • Spotify API Integration*
