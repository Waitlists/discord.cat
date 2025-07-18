# Elasticsearch API Key Setup Guide

## Current Status: Username/Password Authentication Working ✅

Your application is currently using username/password authentication which is working perfectly. API key authentication is optional but recommended for production use.

## Step 1: Create API Key in Elasticsearch Cloud

1. **Go to your Elasticsearch Cloud Console**: https://cloud.elastic.co/deployments
2. **Click on your deployment**
3. **Navigate to "Security" → "API Keys"**
4. **Click "Create API key"**
5. **Configure the API key**:
   - Name: `discord-message-viewer`
   - Expiration: Set to your preference (or no expiration)
   - Role: `superuser` (or create custom role with read/write permissions)
6. **Copy the API key** (it will look like: `VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6dWkybHA2MzdUeGVhc0lxbFVrUHgzZw==`)

## Step 2: Update Replit Secrets

1. **Go to Replit Secrets** (lock icon in sidebar)
2. **Add new secret** (keep existing ones for now):
   - Key: `ELASTICSEARCH_API_KEY`
   - Value: The API key you copied from step 1
3. **Optional**: Once API key is working, you can remove:
   - `ELASTICSEARCH_USERNAME`
   - `ELASTICSEARCH_PASSWORD`

## Step 3: Verify Connection

The application will automatically detect the API key and use it for authentication. You should see:
- Connection status indicator turns green
- Console logs show "Elasticsearch configured with API key"
- Health check returns `{"connected": true}`

## Benefits of API Key Authentication

- **More secure**: API keys can have specific permissions
- **Better for production**: No shared passwords
- **Easier rotation**: Keys can be regenerated without changing passwords
- **Fine-grained access**: Can limit permissions to specific indices/operations

## Troubleshooting

If the API key doesn't work:
1. Ensure the key has sufficient permissions
2. Check that the key hasn't expired
3. Verify the key was copied correctly (no extra spaces)
4. Try creating a new API key with `superuser` role

The application will automatically switch to API key authentication once the secret is set.