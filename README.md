# Productivity Dashboard

A modern, personal productivity dashboard that integrates with Google Calendar to help you manage your tasks, goals, and schedule in one place.

![Productivity Dashboard](https://img.shields.io/badge/React-19.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Vite](https://img.shields.io/badge/Vite-6.2-purple) ![Firebase](https://img.shields.io/badge/Firebase-12.5-orange)

## ✨ Features

- 📅 **Google Calendar Integration** - View today's events from your Google Calendar
- ✅ **Task Management** - Organize daily tasks with completion tracking
- 🎯 **Goal Setting** - Set and track weekly and monthly goals
- 🔗 **Quick Access Links** - Keep frequently used links at your fingertips
- 🌓 **Dark Mode** - Beautiful dark/light theme support
- 💾 **Local Storage** - All data stored locally using IndexedDB (Dexie)
- 🔄 **Auto-Sync** - Calendar automatically refreshes every 5 minutes and at midnight
- 🔐 **Secure** - Firebase authentication with Google OAuth

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Firebase project (for authentication)
- Google Calendar API enabled (for calendar integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd productivity-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Go to Project Settings > General
   - Copy your Firebase configuration values
   - Paste them into `.env.local`:
     ```env
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
     VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
     VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
     ```

5. **Enable Google Calendar API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your Firebase project
   - Navigate to **APIs & Services** > **Library**
   - Search for "Google Calendar API" and enable it
   - Go to **APIs & Services** > **OAuth consent screen**
   - Add scope: `https://www.googleapis.com/auth/calendar.events.readonly`
   - Add your email as a test user (if using External app type)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:1122`
   - Sign in with Google
   - Grant calendar permissions when prompted

## 📖 Usage

### Adding Tasks and Goals

- Click the input field in any section (Tasks, Weekly Goals, Monthly Goals)
- Type your item and press Enter
- Click the checkbox to mark items as complete
- Click the delete icon to remove items

### Quick Access Links

- Click "Add Link" in the Quick Access section
- Enter a name and URL
- Click the link to open it in a new tab
- Delete links you no longer need

### Calendar Sync

The calendar automatically:
- **Refreshes every 5 minutes** - Keeps your schedule up-to-date
- **Refreshes at midnight** - Loads the new day's events
- **Shows today's events** - Displays events from your primary Google Calendar

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server (port 1122)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Start production server
- `npm run serve` - Build and start production server

### Project Structure

```
productivity-dashboard/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard component
│   ├── Header.tsx       # App header with user info
│   ├── Timeline.tsx     # Calendar events timeline
│   ├── ItemList.tsx     # Reusable list component
│   ├── QuickAccess.tsx  # Quick links component
│   └── LoginScreen.tsx  # Authentication screen
├── services/           # Service modules
│   ├── firebase.ts     # Firebase configuration
│   ├── googleCalendar.ts # Google Calendar API
│   └── localDB.ts      # IndexedDB wrapper (Dexie)
├── types.ts            # TypeScript type definitions
├── server.js           # Production server
└── vite.config.ts      # Vite configuration
```

## 🔧 Configuration

### Environment Variables

All configuration is done through `.env.local` (not committed to git):

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | Optional |
| `PORT` | Server port (default: 1122) | Optional |
| `GEMINI_API_KEY` | Gemini API key (if used) | Optional |

### Calendar Sync Behavior

The calendar syncs automatically with the following schedule:

1. **On page load** - Fetches today's events immediately
2. **Every 5 minutes** - Periodic refresh to catch new events
3. **At midnight** - Refreshes to load the new day's events
4. **Daily at midnight** - Continues refreshing every 24 hours

This ensures your calendar is always up-to-date without manual intervention.

## 🚢 Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Run Production Server

```bash
npm start
```

The server will run on `http://localhost:1122` (or your configured PORT).

### macOS Background Service

To run as a background service on macOS:

```bash
chmod +x setup-mac-app.sh
./setup-mac-app.sh
```

This will:
- Build the app
- Create a launchd service
- Auto-start on login
- Keep the app running in the background

See the script for more details.

## 🛡️ Security

- **Environment variables** - All secrets are stored in `.env.local` (gitignored)
- **Local storage** - User data is stored locally in IndexedDB
- **OAuth tokens** - Stored in sessionStorage (cleared on logout)
- **No backend** - All processing happens client-side

## 🧪 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Firebase** - Authentication
- **Google Calendar API** - Calendar integration
- **Dexie (IndexedDB)** - Local database
- **Node.js** - Production server

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Troubleshooting

### Calendar not loading?

1. **Check Google Calendar API is enabled**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Google Calendar API" for your project

2. **Verify OAuth consent screen**
   - Make sure `calendar.events.readonly` scope is added
   - Add your email as a test user

3. **Check browser console**
   - Open DevTools (F12) and look for error messages
   - Verify the access token exists: `sessionStorage.getItem('google-access-token')`

4. **Re-authenticate**
   - Sign out and sign in again
   - Grant calendar permissions when prompted

### Build errors?

- Make sure all dependencies are installed: `npm install`
- Check that `.env.local` exists and has all required variables
- Verify Node.js version is 18+: `node --version`

### Port already in use?

Change the port in `.env.local`:
```env
PORT=1123
```

Then rebuild and restart.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ for productivity enthusiasts
