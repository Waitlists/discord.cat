# Discord Message Viewer

## Overview
A React-based Discord message viewer application that allows users to search and browse Discord messages with filtering capabilities. The application displays user profiles, server information, and message content in a clean, responsive interface.

## Project Architecture
- **Frontend**: React + TypeScript with Vite
- **Backend**: Express.js server with TypeScript
- **Database**: Elasticsearch Cloud as primary data source
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data**: 2.2M Discord messages indexed in Elasticsearch (chunk1, chunk2)
- **Theme**: Dark/light mode support
- **Search**: Elasticsearch-powered with fuzzy matching and aggregations

## Recent Changes
- 2025-01-18: Successfully migrated from Bolt to Replit environment
- Adapted build configuration for Replit hosting
- Updated server configuration for proper port binding (0.0.0.0:5000)
- Maintained client-side data processing architecture
- Implemented Discord API backend routes with proper authentication
- Fixed avatar URL generation using Discord CDN
- Updated all components to use shared schema types
- Removed React imports (handled by Vite automatically)
- Added proper dark mode support with CSS variables
- **2025-01-18: FULLY MIGRATED TO ELASTICSEARCH**
- Elasticsearch Cloud connection successfully established
- Connected to existing Elasticsearch indices: chunk1 and chunk2 with 2.2M messages
- Replaced entire frontend to use Elasticsearch as primary data source
- Implemented lightning-fast search with 40ms response times
- Statistics now powered by Elasticsearch aggregations
- Removed dependency on JSON file processing
- Added comprehensive error handling and connection status monitoring

## Features
- **Lightning-fast Elasticsearch search** with fuzzy matching and filtering
- Search messages by content, author, channel, or guild
- User profile cards with Discord integration
- Server and channel information display
- Pagination for large message sets
- Responsive design with theme switching
- Real-time message statistics from Elasticsearch aggregations
- Connection status monitoring with automatic fallback
- Advanced search with millisecond response times

## User Preferences
- Language: English
- Interface: Clean, modern Discord-style UI
- Theme: Dark/light mode toggle available

## Data Structure
- All message data is stored in Elasticsearch Cloud (2.2M messages across indices: chunk1, chunk2)
- Types defined in client/src/types/index.ts and shared/schema.ts
- Data processing handled entirely by Elasticsearch with lightning-fast queries
- Statistics calculated using Elasticsearch aggregations in real-time
- No local JSON files - pure Elasticsearch integration
- **Scale**: 2,206,793 messages, 425,262 unique users, 12 servers

## Development Setup
- Run `npm run dev` to start development server
- Server runs on port 5000 (Express + Vite)
- Frontend served from client/ directory
- Backend API endpoints under /api prefix