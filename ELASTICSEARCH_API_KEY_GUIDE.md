# Quick API Key Setup Guide

## Current Status ✅
Your Elasticsearch connection is working perfectly with username/password authentication.

## Why Switch to API Key?
- **More secure**: API keys can have limited permissions
- **Better for production**: No shared passwords
- **Easier management**: Keys can be rotated without changing passwords
- **Fine-grained control**: Limit access to specific operations

## Simple Setup Steps

### 1. Create API Key in Elasticsearch Cloud
1. Go to: https://cloud.elastic.co/deployments
2. Click your deployment
3. Go to "Security" → "API Keys"
4. Click "Create API key"
5. Set name: `discord-message-viewer`
6. Set role: `superuser` (or custom role)
7. Copy the generated API key

### 2. Add to Replit Secrets
1. Click the lock icon in Replit sidebar
2. Add new secret:
   - Key: `ELASTICSEARCH_API_KEY`
   - Value: Your API key from step 1

### 3. Test (Optional)
Run this command to test both authentication methods:
```bash
cd scripts && npx tsx test-api-key.ts
```

## How It Works
The application automatically detects which authentication method to use:
1. If `ELASTICSEARCH_API_KEY` exists → uses API key
2. If `ELASTICSEARCH_USERNAME` and `ELASTICSEARCH_PASSWORD` exist → uses username/password
3. API key takes priority over username/password

## Your Current Setup
- ✅ Username/Password: Working perfectly
- ❓ API Key: Not configured (optional)
- 📊 46 messages indexed and searchable
- ⚡ 40-200ms response times