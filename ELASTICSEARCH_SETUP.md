# Elasticsearch Setup Guide

## Overview
This guide explains how to set up Elasticsearch for fast message searching in your Discord Message Viewer application.

## Option 1: Elastic Cloud (Recommended)
Elastic Cloud is the easiest way to get started with Elasticsearch.

### Steps:
1. Go to [cloud.elastic.co](https://cloud.elastic.co)
2. Create a free account
3. Create a new deployment
4. Copy the Cloud ID and credentials

### Environment Variables:
Add these to your Replit secrets:
```
ELASTICSEARCH_CLOUD_ID=your_cloud_id_here
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password_here
```

## Option 2: Local Elasticsearch (Development)
For local development, you can run Elasticsearch using Docker.

### Environment Variables:
```
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password
```

## Option 3: Other Cloud Providers
You can also use other managed Elasticsearch services like:
- AWS Elasticsearch Service
- Google Cloud Elasticsearch
- Azure Elasticsearch Service

Set the appropriate `ELASTICSEARCH_URL` and credentials.

## Migration Process

### 1. Check Connection
First, verify your Elasticsearch connection:
```bash
curl https://your-replit-url.replit.dev/api/search/health
```

### 2. Run Migration Script
Convert your JSON data to Elasticsearch:
```bash
tsx scripts/migrate-to-elasticsearch.ts migrate
```

### 3. Verify Migration
Check the statistics:
```bash
tsx scripts/migrate-to-elasticsearch.ts stats
```

### 4. Test Search
Test the search functionality:
```bash
tsx scripts/migrate-to-elasticsearch.ts test
```

## Migration Script Commands

### Available Commands:
- `migrate` - Migrate all JSON files to Elasticsearch (default)
- `stats` - Show current Elasticsearch statistics
- `test` - Test search functionality with sample queries
- `reset` - Delete and recreate the index (use with caution)

### Usage Examples:
```bash
# Full migration
tsx scripts/migrate-to-elasticsearch.ts migrate

# Check stats only
tsx scripts/migrate-to-elasticsearch.ts stats

# Test search
tsx scripts/migrate-to-elasticsearch.ts test

# Reset index (WARNING: This deletes all data)
tsx scripts/migrate-to-elasticsearch.ts reset
```

## API Endpoints

### Search Messages
```
GET /api/search/messages?q=hello&author_id=123&page=1&size=50
```

Parameters:
- `q` - Search query (searches message content)
- `author_id` - Filter by author ID
- `channel_id` - Filter by channel ID
- `guild_id` - Filter by guild ID
- `page` - Page number (default: 1)
- `size` - Results per page (default: 50)
- `sort` - Sort by 'timestamp' or 'relevance' (default: 'timestamp')

### Get Statistics
```
GET /api/search/stats
```

### Health Check
```
GET /api/search/health
```

## Performance Benefits

### Before (JSON Files):
- Linear search through all messages
- No indexing
- Slow for large datasets
- Limited search capabilities

### After (Elasticsearch):
- Indexed search with millisecond response times
- Full-text search with relevance scoring
- Fuzzy matching for typos
- Aggregations and analytics
- Scalable to millions of messages

## Search Features

### Full-Text Search
- Search across message content
- Fuzzy matching for typos
- Relevance scoring

### Filters
- Author ID
- Channel ID
- Guild ID
- Date ranges

### Sorting
- By timestamp (newest first)
- By relevance (best matches first)

### Highlighting
- Search terms are highlighted in results
- Snippet extraction from long messages

## Troubleshooting

### Connection Issues
1. Check your environment variables
2. Verify Elasticsearch is running
3. Check network connectivity
4. Verify credentials

### Migration Issues
1. Check JSON file format
2. Verify sufficient disk space
3. Check Elasticsearch cluster health
4. Review migration logs

### Search Issues
1. Check index exists
2. Verify data was indexed correctly
3. Test with simple queries first
4. Check Elasticsearch logs

## Security Notes

### Production Considerations:
- Use HTTPS for Elasticsearch connections
- Enable authentication
- Use IP whitelisting
- Regular security updates
- Monitor access logs

### Environment Variables:
- Never commit credentials to version control
- Use Replit secrets for sensitive data
- Rotate credentials regularly

## Next Steps

1. Set up your Elasticsearch service
2. Add environment variables to Replit
3. Run the migration script
4. Test search functionality
5. Monitor performance and optimize as needed

For support, check the Elasticsearch documentation at [elastic.co/guide](https://www.elastic.co/guide/)