# Discord Message Viewer

## Overview
A React-based Discord message viewer application that allows users to search and browse Discord messages with filtering capabilities. The application displays user profiles, server information, and message content in a clean, responsive interface.

## Project Architecture
- **Frontend**: React + TypeScript with Vite
- **Backend**: Express.js server with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data**: JSON files containing Discord message data
- **Theme**: Dark/light mode support

## Recent Changes
- 2025-01-18: Migrated from Bolt to Replit environment
- Adapted build configuration for Replit hosting
- Updated server configuration for proper port binding (0.0.0.0:5000)
- Maintained client-side data processing architecture

## Features
- Search messages by content, author, channel, or guild
- User profile cards with Discord integration
- Server and channel information display
- Pagination for large message sets
- Responsive design with theme switching
- Real-time message statistics

## User Preferences
- Language: English
- Interface: Clean, modern Discord-style UI
- Theme: Dark/light mode toggle available

## Data Structure
- Message data is stored in JSON files (discord_messages1.json through discord_messages31.json)
- Types defined in client/src/types/index.ts
- Data processing handled client-side for performance

## Development Setup
- Run `npm run dev` to start development server
- Server runs on port 5000 (Express + Vite)
- Frontend served from client/ directory
- Backend API endpoints under /api prefix