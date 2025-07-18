import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Discord API routes
  app.get("/api/discord/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { size } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const discordToken = process.env.DISCORD_TOKEN;
      if (!discordToken) {
        return res.status(500).json({ error: "Discord token not configured" });
      }

      // Fetch user from Discord API
      const discordResponse = await fetch(`https://discord.com/api/v10/users/${userId}`, {
        headers: {
          'Authorization': `Bot ${discordToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!discordResponse.ok) {
        if (discordResponse.status === 404) {
          return res.status(404).json({ error: "User not found" });
        }
        return res.status(discordResponse.status).json({ error: "Failed to fetch user from Discord" });
      }

      const userData = await discordResponse.json();
      
      // Construct avatar URL
      const avatarSize = size || 128;
      let avatarUrl = `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`;
      
      if (userData.avatar) {
        const extension = userData.avatar.startsWith('a_') ? 'gif' : 'png';
        avatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.${extension}?size=${avatarSize}`;
      }
      
      // Return user data with proper avatar URL
      res.json({
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        avatar_url: avatarUrl,
        global_name: userData.global_name,
        bot: userData.bot,
        system: userData.system,
        public_flags: userData.public_flags
      });
    } catch (error) {
      console.error("Discord API error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
