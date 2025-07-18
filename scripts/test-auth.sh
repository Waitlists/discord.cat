#!/bin/bash
echo '🔧 Testing API Key Authentication...'
echo '=================================='
echo ''

# Test API key authentication
npx tsx test-api-key.ts

echo ''
echo '💡 To use API key authentication:'
echo '1. Get API key from Elasticsearch Cloud console'
echo '2. Add ELASTICSEARCH_API_KEY secret in Replit'
echo '3. The app will automatically use API key over username/password'
echo ''
echo '📊 Current setup is working great with username/password!'

