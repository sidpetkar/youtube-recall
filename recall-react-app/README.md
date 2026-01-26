# YouTube Liked Videos Organizer

A Next.js web application to fetch and organize your liked YouTube videos.

## Features

- 🎨 Modern UI with shadcn/ui components
- 🌓 Dark mode support (day/night mode)
- ⚡ Built with Next.js 14 and React 18
- 📱 Responsive design
- 🎯 TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Google Cloud Platform account (for YouTube API access)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Google OAuth credentials (see YouTube API Setup below)

3. Create a `.env.local` file from `.env.local.example`:
```bash
cp .env.local.example .env.local
```

4. Fill in your Google OAuth credentials in `.env.local`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## YouTube API Setup

To connect your YouTube account and fetch liked videos, you need to set up Google OAuth credentials:

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Navigate to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

### Step 2: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required information
   - Add scopes: `https://www.googleapis.com/auth/youtube.readonly`
   - Add test users (your Google account) if in testing mode
4. Create OAuth client ID:
   - Application type: "Web application"
   - Name: "YouTube Organizer" (or any name you prefer)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/youtube/callback` (for local development)
     - `https://yourdomain.com/api/youtube/callback` (for production)
5. Copy the Client ID and Client Secret

### Step 3: Configure Environment Variables

Add the credentials to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Connect Your Account

1. Start the development server
2. Click "Let's connect Youtube" button in the header
3. Sign in with your Google account
4. Grant permissions to access your YouTube data
5. You'll be redirected back to the app with your account connected

### Important Notes

- The app requests read-only access to your YouTube data
- OAuth tokens are stored in HTTP-only cookies for security
- In production, consider using a proper session management solution or database
- Make sure to add your production URL to authorized redirect URIs in Google Cloud Console

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── youtube/       # YouTube API endpoints
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles and theme variables
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── app-sidebar.tsx    # Main sidebar navigation
│   ├── app-header.tsx     # Top header with search
│   ├── youtube-connect-dialog.tsx  # OAuth connection modal
│   ├── video-card.tsx     # Video card component
│   ├── recently-liked-carousel.tsx  # Carousel for videos
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── hooks/                  # Custom React hooks
│   └── use-mobile.ts      # Mobile detection hook
├── lib/                    # Utility functions
│   ├── utils.ts           # Utility functions (cn helper)
│   └── youtube.ts         # YouTube API client
└── components.json         # shadcn/ui configuration
```

## Available Components

The following shadcn/ui components are already set up and ready to use:

- Button
- Card
- Dialog
- Dropdown Menu
- Input
- Label
- Select
- Separator
- Tabs
- Toast
- Tooltip
- Avatar
- Checkbox
- Popover
- Sidebar
- Carousel
- Sheet

## Dark Mode

The app includes a theme toggle in the top right corner. You can switch between:
- Light mode
- Dark mode
- System preference

## Features

- **Sidebar Navigation**: Collapsible sidebar with navigation items
- **Search**: Search bar in the header (placeholder for future implementation)
- **YouTube Connection**: OAuth flow to connect your Google account
- **Recently Liked Videos**: Carousel displaying your 10 most recently liked videos
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Next Steps

- Implement search functionality
- Add video organization features (tags, categories)
- Create video detail pages
- Add filtering and sorting options
- Implement video collections/playlists

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Theme**: next-themes
- **Icons**: lucide-react
- **Carousel**: Embla Carousel
- **YouTube API**: Google APIs (googleapis)
- **OAuth**: Google OAuth 2.0

## Troubleshooting

### OAuth Connection Issues

- Make sure your redirect URI matches exactly in Google Cloud Console
- Check that the YouTube Data API v3 is enabled
- Verify your environment variables are set correctly
- Check browser console for error messages

### Video Fetching Issues

- Ensure you've granted the necessary permissions during OAuth
- Check that your OAuth tokens haven't expired
- Verify your Google account has liked videos
- Check server logs for API errors
