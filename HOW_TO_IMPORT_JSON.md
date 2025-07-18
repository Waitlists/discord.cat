# How to Import Your JSON Files to Elasticsearch

## Simple Method - Direct Import

Your existing JSON files work perfectly with Elasticsearch as-is. No conversion needed!

### Step 1: Set up Elasticsearch Cloud
1. Go to [cloud.elastic.co](https://cloud.elastic.co)
2. Create a free account
3. Create a new deployment
4. Copy your credentials

### Step 2: Add Environment Variables
In Replit, go to Secrets and add:
```
ELASTICSEARCH_CLOUD_ID=your_cloud_id_here
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password_here
```

### Step 3: Import Your JSON Files
Run this simple command:
```bash
tsx scripts/import-json-to-elasticsearch.ts
```

That's it! The script will:
- Read all your JSON files from `client/src/data/`
- Import them directly into Elasticsearch
- Keep your original timestamp format
- Create proper search indexes
- Show you statistics when done

## What Happens During Import

Your JSON structure like this:
```json
{
  "message_id": "1335738531678519447",
  "content": "i know lots of 12 olds who smoke za",
  "author_id": "940269178902954034", 
  "channel_id": "1323779783351337114",
  "guild_id": "1323779783351337112",
  "timestamp": "2025-02-02 22:28:02.774000+00:00"
}
```

Gets imported exactly as-is into Elasticsearch with:
- Fast full-text search on `content`
- Filtering by `author_id`, `channel_id`, `guild_id`
- Time-based sorting using your existing `timestamp` format
- Additional helper fields for search optimization

## After Import

Your app will automatically use Elasticsearch for:
- Lightning-fast message search
- Author and channel filtering
- Time-based sorting
- Fuzzy matching for typos

## Manual Method (Alternative)

If you prefer using Elasticsearch Cloud's web interface:

1. **Create NDJSON file** (optional):
   ```bash
   tsx scripts/convert-to-ndjson.ts simple
   ```

2. **Upload in Kibana**:
   - Go to Kibana → Machine Learning → Data Visualizer
   - Upload the `discord_messages_simple.ndjson` file
   - Set format to "JSON Lines"
   - Set index name to "discord-messages"
   - Click Import

Both methods work with your existing JSON structure - no changes needed!