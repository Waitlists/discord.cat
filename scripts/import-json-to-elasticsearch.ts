#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { elasticsearchService } from '../server/elasticsearch';
import { DiscordMessage } from '../shared/schema';

const BATCH_SIZE = 1000;

async function importJsonToElasticsearch(): Promise<void> {
  console.log('🚀 Importing JSON files directly to Elasticsearch...');
  
  // Check connection first
  const isConnected = await elasticsearchService.checkConnection();
  if (!isConnected) {
    console.error('❌ Cannot connect to Elasticsearch. Check your environment variables:');
    console.log('   ELASTICSEARCH_CLOUD_ID (for Elastic Cloud)');
    console.log('   ELASTICSEARCH_USERNAME');
    console.log('   ELASTICSEARCH_PASSWORD');
    console.log('   Or ELASTICSEARCH_URL for other providers');
    process.exit(1);
  }
  
  // Create the index with proper mapping
  await elasticsearchService.createIndex();
  
  // Load all JSON files from data directory
  const dataDir = join(process.cwd(), 'client', 'src', 'data');
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  console.log(`📂 Found ${files.length} JSON files to import`);
  
  let totalMessages = 0;
  let allMessages: DiscordMessage[] = [];
  
  // Load all messages from JSON files
  for (const file of files) {
    try {
      const filePath = join(dataDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const messages = JSON.parse(content) as DiscordMessage[];
      
      // Basic validation - keep only valid messages
      const validMessages = messages.filter(msg => {
        return msg.message_id && msg.author_id && msg.channel_id && msg.guild_id;
      });
      
      console.log(`📄 Loaded ${validMessages.length} valid messages from ${file}`);
      allMessages = allMessages.concat(validMessages);
      totalMessages += validMessages.length;
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error);
    }
  }
  
  if (totalMessages === 0) {
    console.error('❌ No valid messages found to import');
    process.exit(1);
  }
  
  // Sort by timestamp (newest first)
  allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  console.log(`📊 Total messages to import: ${totalMessages.toLocaleString()}`);
  
  // Import in batches
  const totalBatches = Math.ceil(allMessages.length / BATCH_SIZE);
  console.log(`📦 Processing in ${totalBatches} batches of ${BATCH_SIZE}`);
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, allMessages.length);
    const batch = allMessages.slice(start, end);
    
    try {
      await elasticsearchService.bulkIndexMessages(batch);
      console.log(`✅ Batch ${i + 1}/${totalBatches} completed (${end}/${allMessages.length} messages)`);
    } catch (error) {
      console.error(`❌ Batch ${i + 1} failed:`, error);
      throw error;
    }
  }
  
  console.log('🎉 Import completed successfully!');
  
  // Show final statistics
  await showStats();
  await testSearch();
}

async function showStats(): Promise<void> {
  console.log('\n📊 Final Statistics:');
  try {
    const stats = await elasticsearchService.getMessageStats();
    console.log(`   Total Messages: ${stats.total_messages.toLocaleString()}`);
    console.log(`   Unique Authors: ${stats.unique_authors.toLocaleString()}`);
    console.log(`   Unique Channels: ${stats.unique_channels.toLocaleString()}`);
    console.log(`   Unique Guilds: ${stats.unique_guilds.toLocaleString()}`);
  } catch (error) {
    console.error('❌ Error getting stats:', error);
  }
}

async function testSearch(): Promise<void> {
  console.log('\n🔍 Testing search functionality:');
  try {
    const results = await elasticsearchService.searchMessages({
      content: 'hello',
      size: 3
    });
    
    console.log(`   Found ${results.total} messages containing "hello"`);
    console.log(`   Search took ${results.took}ms`);
    
    if (results.messages.length > 0) {
      console.log('   Sample results:');
      results.messages.forEach((msg, i) => {
        const preview = msg.content.substring(0, 50);
        console.log(`     ${i + 1}. "${preview}${msg.content.length > 50 ? '...' : ''}"`);
      });
    }
  } catch (error) {
    console.error('❌ Error testing search:', error);
  }
}

async function main(): Promise<void> {
  try {
    await importJsonToElasticsearch();
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main();