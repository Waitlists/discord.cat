# Discord.cat

Advanced Discord message exploration and analytics platform with real Discord user data fetching.

## Features

- 🔍 **Advanced Search** - Search through Discord messages with multiple filters
- 👤 **Real User Profiles** - Fetch actual Discord usernames and profile pictures
- 📊 **Analytics** - View message statistics and user activity
- 🎨 **Beautiful UI** - Modern design with dark/light theme support
- ⚡ **Fast Performance** - Optimized with caching and rate limiting

## Architecture

### Frontend (React + TypeScript)
- Modern React with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Custom hooks for Discord data fetching

### Backend (Express.js)
- Express.js server for Discord API proxy
- Rate limiting and caching
- CORS handling for browser requests
- Comprehensive error handling

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Discord Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and copy the token
4. Create `.env` file:
```env
VITE_DISCORD_BOT_TOKEN=your_discord_bot_token_here
```

### 3. Run the Application

#### Development (Full Stack)
```bash
npm run dev:full
```
This starts both the backend server (port 3001) and frontend (port 5173).

#### Individual Services
```bash
# Backend only
npm run dev:server

# Frontend only  
npm run dev
```

## API Endpoints

### Backend Server (http://localhost:3001)

#### Get Single User
```
GET /api/discord/users/:userId?size=128
```

#### Get Multiple Users (Batch)
```
POST /api/discord/users/batch
Content-Type: application/json

{
  "userIds": ["123456789", "987654321"],
  "size": 128
}
```

#### Health Check
```
GET /health
```

#### Cache Statistics
```
GET /api/cache/stats
```

## Features

### Real Discord Data
- ✅ Actual Discord usernames and display names
- ✅ Real profile pictures with proper avatar hashes
- ✅ Support for animated GIF avatars
- ✅ Fallback to default Discord avatars

### Performance
- 🚀 **Caching** - 5-minute cache for user data
- 🚀 **Rate Limiting** - 50 requests per minute per client
- 🚀 **Batch Requests** - Fetch multiple users efficiently
- 🚀 **Request Deduplication** - Prevents duplicate API calls

### Error Handling
- 🛡️ **Graceful Fallbacks** - Handles API errors smoothly
- 🛡️ **User Validation** - Validates Discord user ID format
- 🛡️ **Rate Limit Protection** - Prevents API abuse
- 🛡️ **CORS Support** - Proper cross-origin handling

## Environment Variables

```env
# Required: Discord Bot Token
VITE_DISCORD_BOT_TOKEN=your_discord_bot_token_here

# Optional: Server Configuration
PORT=3001
NODE_ENV=development
```

## Production Deployment

1. **Build Frontend**
```bash
npm run build
```

2. **Deploy Backend**
- Deploy the `server/` directory to your hosting platform
- Set environment variables
- Ensure the frontend build is served from the same domain

3. **Environment Setup**
- Set `NODE_ENV=production`
- Configure CORS origins for your domain
- Set up proper logging and monitoring

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure the backend server is running on port 3001
   - Check that CORS is configured for your frontend URL

2. **Discord API Errors**
   - Verify your bot token is correct
   - Ensure the token has proper permissions
   - Check rate limiting if getting 429 errors

3. **User Not Found**
   - Verify the Discord user ID is valid (17-19 digits)
   - Some users may have privacy settings that prevent data access

### Debug Mode
Enable detailed logging by checking the browser console and server logs.

## License

MIT License - see LICENSE file for details.