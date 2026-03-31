# 🚀 Employee Tracking System

A real-time GPS-based employee tracking system built with TanStack Start, React, and Appwrite. This application enables organizations to track field employees, monitor their locations, manage attendance, and ensure data integrity with offline support and anti-tampering features.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19.1-blue)

## ✨ Features

### 🔐 Authentication System
- **Complete Auth Flow**: Sign up, sign in, sign out
- **Password Recovery**: Email-based password reset with automatic URL detection
- **Session Management**: Secure cookie-based sessions with Appwrite
- **Role-Based Access**: Admin and officer role management

### 📍 Real-Time GPS Tracking
- **Live Location Monitoring**: Track employees in real-time on interactive maps
- **Offline Queue**: Automatically queues location data when offline and syncs when connection is restored
- **Battery Monitoring**: Tracks device battery levels to ensure continuous operation
- **Movement Detection**: Detects inactivity and same-location stalling

### 🛡️ Anti-Tampering Features
- **Mock Location Detection**: Identifies fake GPS signals
- **GPS Integrity Checks**: Validates location accuracy and authenticity
- **Activity Monitoring**: Alerts for suspicious patterns
- **Audit Trail**: Complete history of all tracking events

### 📊 Data Management
- **Officer Management**: CRUD operations for employee profiles
- **Location History**: View complete movement history with timestamps
- **Analytics Dashboard**: Visualize tracking data and patterns
- **Export Capabilities**: Download tracking data for reporting

### 🌐 Offline Support
- **IndexedDB Queue**: Stores location pings locally when offline
- **Auto-Sync**: Automatically syncs queued data when connection returns
- **Retry Logic**: Smart retry mechanism for failed sync attempts
- **Data Persistence**: No data loss even during extended offline periods

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode**: Theme switching with next-themes
- **Interactive Maps**: Leaflet-based maps with marker clustering
- **Shadcn UI Components**: Beautiful, accessible component library

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19.1)
- **Language**: TypeScript 5.7
- **Backend**: [Appwrite](https://appwrite.io/) (Node SDK 21.1)
- **Styling**: Tailwind CSS 4.1
- **State Management**: TanStack Query 5.90
- **Routing**: TanStack Router 1.132
- **Maps**: Leaflet 1.9 with Marker Clustering
- **Forms**: React Hook Form 7.63 + Zod 4.1
- **Build Tool**: Vite with Rolldown
- **Runtime**: Bun
- **UI Components**: Radix UI + Shadcn

## 📋 Prerequisites

- **Bun** 1.2+ (or Node.js 22+)
- **Appwrite** instance (Cloud or Self-hosted)
- **Git** for version control

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/milandare26feb-ops/Employ_Tracking_System.git
cd Employ_Tracking_System
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Update the `.env` file with your Appwrite credentials:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DB_ID=imagine-project-db
VITE_APPWRITE_BUCKET_ID=imagine-project-bucket

# Server-side API Key (required for admin operations)
APPWRITE_API_KEY=your-api-key

# Optional: Analytics/Instrumentation
VITE_INSTRUMENTATION_SCRIPT_SRC=
```

#### Required Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APPWRITE_ENDPOINT` | Your Appwrite instance URL | `https://sgp.cloud.appwrite.io/v1` |
| `VITE_APPWRITE_PROJECT_ID` | Appwrite Project ID | `69cb0dd10032c979e8b7` |
| `VITE_APPWRITE_DB_ID` | Database ID in Appwrite | `imagine-project-db` |
| `VITE_APPWRITE_BUCKET_ID` | Storage bucket ID | `imagine-project-bucket` |
| `APPWRITE_API_KEY` | Server-side API key with admin permissions | Your API key |

**Note:** The app includes sensible defaults. If you're using the pre-configured Appwrite instance, only the `APPWRITE_API_KEY` needs to be set.

### 4. Run Development Server

```bash
bun run dev
```

The application will start at `http://localhost:3000`.

### 5. Set Up Appwrite Database

Create the following collections in your Appwrite database:

#### Collections Required:
- **officers**: Employee profiles and credentials
- **locations**: GPS tracking data
- **attendance**: Check-in/check-out records

Refer to `src/server/lib/types.ts` for the complete schema.

## 📱 Application Routes

### Authentication Routes
- `/sign-up` - Create a new account
- `/sign-in` - Login to existing account
- `/sign-out` - Logout and clear session
- `/forgot-password` - Request password reset
- `/reset-password` - Set new password via recovery link

### Dashboard Routes
- `/` - Main dashboard (protected)
- `/officers` - Officer management (admin only)
- `/tracking` - Real-time tracking map
- `/history` - Location history and reports
- `/profile` - User profile and settings

## 🏗️ Building for Production

### Build the Application

```bash
bun run build
```

This will:
1. Generate TanStack Router routes
2. Type-check with TypeScript
3. Build optimized production bundle with source maps

### Run Production Server

```bash
bun run start
```

The production server will start on `http://localhost:3000` (or the port specified in the `PORT` environment variable).

### Build for Node.js Deployment

```bash
bun run build:node
```

This creates a Node.js-compatible build for platforms like Vercel, Netlify, or traditional servers.

## 🧪 Testing

This project uses [Vitest](https://vitest.dev/) for testing:

```bash
bun run test
```

## 🎨 Styling

The project uses **Tailwind CSS v4** with the new Vite plugin for instant styling updates.

## 🔍 Code Quality

### Linting & Formatting

```bash
# Run ESLint
bun run lint

# Format code with Prettier
bun run format

# Check formatting
bun run format:check
```

### Adding Shadcn Components

```bash
bunx shadcn@latest add button
bunx shadcn@latest add dialog
bunx shadcn@latest add table
```

## 📦 Project Structure

```
├── src/
│   ├── components/        # Reusable React components
│   │   ├── auth/         # Authentication components
│   │   └── ui/           # Shadcn UI components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party integrations
│   ├── lib/              # Utility functions and configs
│   │   ├── appwrite-config.ts    # Appwrite configuration
│   │   ├── locationTracker.ts    # GPS tracking logic
│   │   ├── offlineQueue.ts       # Offline data queue
│   │   └── utils.ts              # Helper functions
│   ├── routes/           # TanStack Router routes (file-based)
│   ├── server/           # Server-side functions
│   │   ├── functions/    # Server actions (auth, officers)
│   │   └── lib/          # Server utilities and types
│   ├── router.tsx        # Router configuration
│   └── styles.css        # Global styles
├── public/               # Static assets
├── battery.d.ts          # TypeScript definitions for Battery API
├── ERROR_FIXES.md        # Documentation of bug fixes
├── .env.example          # Environment variables template
└── package.json          # Dependencies and scripts
```

## 🔑 Key Features Explained

### Real-Time GPS Tracking

The `locationTracker.ts` module provides:
- **5-second GPS polling**: Tracks location every 5 seconds
- **Mock location detection**: Identifies fake GPS signals
- **Battery monitoring**: Tracks device battery levels
- **Inactivity alerts**: Detects when employee is stationary for too long

### Offline Queue System

The `offlineQueue.ts` module uses IndexedDB to:
- Store location pings when offline
- Auto-sync when connection is restored
- Retry failed sync attempts
- Prune old synced data (48-hour retention)

### Anti-Tampering Features

- Accuracy threshold checks (< 5m is suspicious)
- Speed vs. movement validation
- GPS enabled/disabled detection
- Complete audit trail of all events

## 🐛 Bug Fixes Applied

This codebase includes several critical fixes documented in `ERROR_FIXES.md`:

1. ✅ **Zod Import Pattern** - Fixed inconsistent import in `auth.ts`
2. ✅ **Memory Leak** - Fixed event listener cleanup in `offlineQueue.ts`
3. ✅ **Bucket Configuration** - Added default bucket ID
4. ✅ **Type Safety** - Created Battery API TypeScript definitions
5. ✅ **Package.json Typo** - Fixed clean script typo

See `ERROR_FIXES.md` for complete details.

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Build for production with source maps |
| `bun run build:node` | Build for Node.js deployment |
| `bun run start` | Run production server |
| `bun run test` | Run Vitest tests |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |
| `bun run format:check` | Check code formatting |
| `bun run generate:routes` | Generate TanStack Router routes |
| `bun run clean` | Clean build artifacts |

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy! Vercel auto-detects TanStack Start

### Docker

```bash
docker build -t employee-tracking .
docker run -p 3000:3000 --env-file .env employee-tracking
```

### Traditional Server

```bash
bun run build:node
# Deploy the .output directory to your server
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Milan Dare** - [@milandare26feb-ops](https://github.com/milandare26feb-ops)

## 🙏 Acknowledgments

- [TanStack](https://tanstack.com/) for amazing React tools
- [Appwrite](https://appwrite.io/) for backend services
- [Shadcn](https://ui.shadcn.com/) for beautiful UI components
- [Leaflet](https://leafletjs.com/) for mapping capabilities

## 📞 Support

For support, email milandare26feb@gmail.com or open an issue in the GitHub repository.

## 🔗 Links

- [Documentation](https://github.com/milandare26feb-ops/Employ_Tracking_System/wiki)
- [Report Bug](https://github.com/milandare26feb-ops/Employ_Tracking_System/issues)
- [Request Feature](https://github.com/milandare26feb-ops/Employ_Tracking_System/issues)

---

**Made with ❤️ using TanStack Start and Appwrite**
