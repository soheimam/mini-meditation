# Mini Headspace: Architecture and Technical Overview

## Quick Start Guide

### Prerequisites
- Node.js (v20+)
- npm, yarn, pnpm, or bun
- Redis instance (Upstash recommended)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd mini-headspace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure `.env.local` with Redis credentials:
   ```
   REDIS_URL=your-redis-url
   REDIS_TOKEN=your-redis-token
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to start meditating!

## Project Overview

Mini Headspace is a meditation app built on the Farcaster protocol using MiniKit that enables:
1. Guided breathing meditation sessions
2. Meditation streak tracking
3. Daily reminder notifications
4. Web3 wallet authentication

## Core Components

### Frontend Architecture
- **Meditation.tsx**: Manages session state, timing, breathing phases and completion
- **BreathingCircle.tsx**: Visual breathing guide animation
- **CompletionScreen.tsx**: Displays stats and session controls
- **MeditationWalletButton.tsx**: Web3 wallet integration

UI built with React, Next.js and Framer Motion for animations.

### Backend Architecture
- Serverless Next.js API routes for stats, session completion and reminders
- Redis storage via Upstash for data persistence

### Data Models
- **MeditationStats**: Sessions count, streak data, last session date
- **ReminderPreference**: Notification settings and history

### Web3 Integration
- OnchainKit/MiniKit for Farcaster integration
- Farcaster Frame SDK for notifications
- User authentication via Farcaster ID (FID)
- Wallet connection via wagmi

## Key Features

### Meditation Session
1. User authenticates with Farcaster
2. 60-second guided breathing exercise with visual cues
3. Ambient audio during meditation
4. Stats updated upon completion

### Streak Tracking
- Tracks consecutive days of meditation
- Resets if user misses a day

### Notification System
- Opt-in daily reminders via Farcaster
- User preferences stored in Redis

## Technical Implementation

### State Management
- React hooks for component state
- MiniKit context for user data
- Custom timers for meditation phases

### Data Storage
- Redis as primary data store
- Keys structured by user FID
- Service layer for data operations

### Redis Implementation
- Key namespacing by functionality
- JSON object storage
- Client initialized from environment variables

### Notification System
- User opt-in on completion screen
- Daily delivery via cron job
- Conditional sending based on time and user activity
- Uses Farcaster Frame SDK for delivery

## System Integration

### Data Flow
- Frontend components ↔ API routes ↔ Service layer ↔ Redis
- Authentication via Farcaster/FID
- Session timing via React hooks
- Notifications via scheduled cron jobs

### Key Design Choices
- Stateless architecture with Redis persistence
- Framer Motion for breathing animations
- Custom streak calculation logic
- 24-hour notification limits
- Wallet authentication requirement

## Future Enhancements
- Customizable session duration
- Additional meditation techniques
- Social sharing features
- NFT rewards for milestones
- Wellness tracker integration
