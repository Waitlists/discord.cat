import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Discord API configuration
const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DISCORD_CDN = 'https://cdn.discordapp.com';
const BOT_TOKEN = process.env.VITE_DISCORD_BOT_TOKEN || process.env.DISCORD_BOT_TOKEN;

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'https://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Rate limiting store
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 50;

// Rate limiting middleware
const rateLimit = (req, res, next) => {
  const clientId = req.ip;
  const now = Date.now();
  
  if (!rateLimitStore.has(clientId)) {
    rateLimitStore.set(clientId, { requests: [], lastCleanup: now });
  }
  
  const clientData = rateLimitStore.get(clientId);
  
  // Clean old requests
  clientData.requests = clientData.requests.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );
  
  if (clientData.requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per minute`
    });
  }
  
  clientData.requests.push(now);
  rateLimitStore.set(clientId, clientData);
  
  next();
};

// Cache for Discord API responses
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to make Discord API requests
async function makeDiscordRequest(endpoint) {
  if (!BOT_TOKEN) {
    throw new Error('Discord bot token not configured');
  }

  const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bot ${BOT_TOKEN}`,
      'User-Agent': 'DiscordCat/1.0.0 (https://discord.cat)',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Discord API Error ${response.status}:`, errorText);
    
    if (response.status === 401) {
      throw new Error('Invalid Discord bot token');
    } else if (response.status === 403) {
      throw new Error('Bot lacks permissions to access this resource');
    } else if (response.status === 404) {
      throw new Error('User not found');
    } else if (response.status === 429) {
      throw new Error('Discord API rate limit exceeded');
    } else {
      throw new Error(`Discord API error: ${response.status}`);
    }
  }

  return response.json();
}

// Generate avatar URL
function getAvatarUrl(userId, avatarHash, size = 128) {
  if (avatarHash) {
    const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `${DISCORD_CDN}/avatars/${userId}/${avatarHash}.${extension}?size=${size}`;
  }
  
  // Discord's default avatar algorithm
  const defaultAvatarIndex = (parseInt(userId) >> 22) % 6;
  return `${DISCORD_CDN}/embed/avatars/${defaultAvatarIndex}.png`;
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    botTokenConfigured: !!BOT_TOKEN
  });
});

// Get Discord user by ID
app.get('/api/discord/users/:userId', rateLimit, async (req, res) => {
  try {
    const { userId } = req.params;
    const { size = 128 } = req.query;

    // Validate user ID
    if (!/^\d{17,19}$/.test(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid Discord snowflake (17-19 digits)'
      });
    }

    // Check cache first
    const cacheKey = userId;
    const cached = userCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📦 Cache hit for user ${userId}`);
      return res.json({
        ...cached.data,
        avatar_url: getAvatarUrl(userId, cached.data.avatar, parseInt(size)),
        cached: true
      });
    }

    console.log(`🔍 Fetching user ${userId} from Discord API`);

    // Fetch from Discord API
    const userData = await makeDiscordRequest(`/users/${userId}`);
    
    // Cache the response
    userCache.set(cacheKey, {
      data: userData,
      timestamp: Date.now()
    });

    // Clean old cache entries periodically
    if (userCache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of userCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          userCache.delete(key);
        }
      }
    }

    console.log(`✅ Successfully fetched user ${userId}: ${userData.username}`);

    // Return user data with avatar URL
    res.json({
      ...userData,
      avatar_url: getAvatarUrl(userId, userData.avatar, parseInt(size)),
      cached: false
    });

  } catch (error) {
    console.error(`❌ Error fetching user ${req.params.userId}:`, error.message);
    
    res.status(error.message.includes('not found') ? 404 : 500).json({
      error: 'Failed to fetch user',
      message: error.message,
      userId: req.params.userId
    });
  }
});

// Get multiple users (batch request)
app.post('/api/discord/users/batch', rateLimit, async (req, res) => {
  try {
    const { userIds, size = 128 } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'userIds must be a non-empty array'
      });
    }

    if (userIds.length > 50) {
      return res.status(400).json({
        error: 'Too many users',
        message: 'Maximum 50 users per batch request'
      });
    }

    const results = {};
    const promises = userIds.map(async (userId) => {
      try {
        // Validate user ID
        if (!/^\d{17,19}$/.test(userId)) {
          results[userId] = { error: 'Invalid user ID format' };
          return;
        }

        // Check cache first
        const cached = userCache.get(userId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          results[userId] = {
            ...cached.data,
            avatar_url: getAvatarUrl(userId, cached.data.avatar, parseInt(size)),
            cached: true
          };
          return;
        }

        // Fetch from Discord API
        const userData = await makeDiscordRequest(`/users/${userId}`);
        
        // Cache the response
        userCache.set(userId, {
          data: userData,
          timestamp: Date.now()
        });

        results[userId] = {
          ...userData,
          avatar_url: getAvatarUrl(userId, userData.avatar, parseInt(size)),
          cached: false
        };

      } catch (error) {
        results[userId] = { 
          error: error.message,
          userId 
        };
      }
    });

    await Promise.all(promises);

    res.json({
      users: results,
      total: userIds.length,
      successful: Object.values(results).filter(r => !r.error).length
    });

  } catch (error) {
    console.error('❌ Batch request error:', error.message);
    res.status(500).json({
      error: 'Batch request failed',
      message: error.message
    });
  }
});

// Get cache statistics (for debugging)
app.get('/api/cache/stats', (req, res) => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp < CACHE_TTL) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }

  res.json({
    totalEntries: userCache.size,
    validEntries,
    expiredEntries,
    cacheTtlMs: CACHE_TTL,
    rateLimitClients: rateLimitStore.size
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Discord API server running on port ${PORT}`);
  console.log(`🔑 Bot token configured: ${!!BOT_TOKEN}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (!BOT_TOKEN) {
    console.warn('⚠️  Warning: Discord bot token not configured. Set VITE_DISCORD_BOT_TOKEN in .env file');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});