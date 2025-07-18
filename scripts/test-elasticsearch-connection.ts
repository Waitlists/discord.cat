#!/usr/bin/env tsx

import { Client } from '@elastic/elasticsearch';

async function testConnection() {
  console.log('🔍 Testing Elasticsearch connection...');
  
  // Log environment variables (without exposing values)
  console.log('Environment check:');
  console.log('- ELASTICSEARCH_CLOUD_ID:', !!process.env.ELASTICSEARCH_CLOUD_ID);
  console.log('- ELASTICSEARCH_USERNAME:', !!process.env.ELASTICSEARCH_USERNAME);
  console.log('- ELASTICSEARCH_PASSWORD:', !!process.env.ELASTICSEARCH_PASSWORD);
  console.log('- Username value:', process.env.ELASTICSEARCH_USERNAME);
  
  if (!process.env.ELASTICSEARCH_CLOUD_ID) {
    console.error('❌ Missing ELASTICSEARCH_CLOUD_ID');
    return;
  }
  
  if (!process.env.ELASTICSEARCH_USERNAME) {
    console.error('❌ Missing ELASTICSEARCH_USERNAME');
    return;
  }
  
  if (!process.env.ELASTICSEARCH_PASSWORD) {
    console.error('❌ Missing ELASTICSEARCH_PASSWORD');
    return;
  }
  
  try {
    const client = new Client({
      cloud: {
        id: process.env.ELASTICSEARCH_CLOUD_ID,
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      }
    });
    
    console.log('🔧 Client created, testing connection...');
    
    const response = await client.ping();
    console.log('✅ Connection successful!', response);
    
    // Test index exists
    const indexExists = await client.indices.exists({ index: 'discord-messages' });
    console.log('📋 Index "discord-messages" exists:', indexExists);
    
    if (indexExists) {
      // Get some basic info
      const stats = await client.indices.stats({ index: 'discord-messages' });
      console.log('📊 Index stats:', {
        docs: stats.indices['discord-messages'].total.docs,
        size: stats.indices['discord-messages'].total.store.size_in_bytes
      });
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    
    if (error.meta) {
      console.error('Response status:', error.meta.statusCode);
      console.error('Response headers:', error.meta.headers);
    }
    
    // Common fixes
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Verify your Cloud ID is correct');
    console.log('2. Check your username (usually "elastic")');
    console.log('3. Verify your password is correct');
    console.log('4. Make sure your deployment is active');
    console.log('5. Check if you need to reset your password');
  }
}

testConnection();