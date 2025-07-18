#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { elasticsearchService } from '../server/elasticsearch';
import { DiscordMessage } from '../shared/schema';

const BATCH_SIZE = 1000; // Process messages in batches

async function loadJSONFiles(): Promise<DiscordMessage[]> {
  const dataDir = join(process.cwd(), 'client', 'src', 'data');
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  console.log(`📂 Found ${files.length} JSON files to process`);
  
  let allMessages: DiscordMessage[] = [];
  
  for (const file of files) {
    try {
      const filePath = join(dataDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const messages = JSON.parse(content) as DiscordMessage[];
      
      console.log(`📄 Loaded ${messages.length} messages from ${file}`);
      allMessages = allMessages.concat(messages);
    } catch (error) {
      console.error(`❌ Error loading ${file}:`, error);
    }
  }
  
  // Sort by timestamp (newest first)
  allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  console.log(`📊 Total messages loaded: ${allMessages.length}`);
  return allMessages;
}

async function validateMessages(messages: DiscordMessage[]): Promise<DiscordMessage[]> {
  const validMessages = messages.filter(msg => {
    // Basic validation
    if (!msg.message_id || !msg.author_id || !msg.channel_id || !msg.guild_id) {
      console.warn(`⚠️ Skipping invalid message: ${JSON.stringify(msg)}`);
      return false;
    }
    
    // Validate timestamp
    const timestamp = new Date(msg.timestamp);
    if (isNaN(timestamp.getTime())) {
      console.warn(`⚠️ Skipping message with invalid timestamp: ${msg.message_id}`);
      return false;
    }
    
    return true;
  });
  
  console.log(`✅ Validated ${validMessages.length} messages (${messages.length - validMessages.length} invalid)`);
  return validMessages;
}

async function migrateToElasticsearch(messages: DiscordMessage[]): Promise<void> {
  console.log('🔄 Starting migration to Elasticsearch...');
  
  // Check connection
  const isConnected = await elasticsearchService.checkConnection();
  if (!isConnected) {
    console.error('❌ Cannot connect to Elasticsearch. Please check your connection settings.');
    console.log('💡 Tips for setting up Elasticsearch:');
    console.log('   1. Use Elastic Cloud (cloud.elastic.co) for hosted solution');
    console.log('   2. Set ELASTICSEARCH_URL environment variable');
    console.log('   3. Set ELASTICSEARCH_USERNAME and ELASTICSEARCH_PASSWORD if needed');
    console.log('   4. For Elastic Cloud, set ELASTICSEARCH_CLOUD_ID');
    process.exit(1);
  }
  
  // Create index
  await elasticsearchService.createIndex();
  
  // Process in batches
  const totalBatches = Math.ceil(messages.length / BATCH_SIZE);
  console.log(`📦 Processing ${messages.length} messages in ${totalBatches} batches of ${BATCH_SIZE}`);
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, messages.length);
    const batch = messages.slice(start, end);
    
    try {
      await elasticsearchService.bulkIndexMessages(batch);
      console.log(`✅ Batch ${i + 1}/${totalBatches} completed (${end}/${messages.length} messages)`);
    } catch (error) {
      console.error(`❌ Batch ${i + 1} failed:`, error);
      throw error;
    }
  }
  
  console.log('🎉 Migration completed successfully!');
}

async function showStats(): Promise<void> {
  console.log('\n📊 Elasticsearch Statistics:');
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
    // Test basic search
    const results = await elasticsearchService.searchMessages({
      content: 'hello',
      size: 5
    });
    
    console.log(`   Found ${results.total} messages containing "hello"`);
    console.log(`   Search took ${results.took}ms`);
    
    if (results.messages.length > 0) {
      console.log('   Sample results:');
      results.messages.slice(0, 3).forEach((msg, i) => {
        console.log(`     ${i + 1}. ${msg.content.substring(0, 50)}...`);
      });
    }
  } catch (error) {
    console.error('❌ Error testing search:', error);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';
  
  switch (command) {
    case 'migrate':
      console.log('🚀 Starting Discord messages migration to Elasticsearch');
      
      // Load and validate messages
      const messages = await loadJSONFiles();
      const validMessages = await validateMessages(messages);
      
      if (validMessages.length === 0) {
        console.error('❌ No valid messages found to migrate');
        process.exit(1);
      }
      
      // Migrate to Elasticsearch
      await migrateToElasticsearch(validMessages);
      
      // Show stats and test search
      await showStats();
      await testSearch();
      break;
      
    case 'stats':
      console.log('📊 Getting Elasticsearch statistics');
      await showStats();
      break;
      
    case 'test':
      console.log('🔍 Testing search functionality');
      await testSearch();
      break;
      
    case 'reset':
      console.log('🗑️ Resetting Elasticsearch index');
      await elasticsearchService.deleteIndex();
      console.log('✅ Index deleted successfully');
      break;
      
    default:
      console.log('Usage: tsx scripts/migrate-to-elasticsearch.ts [command]');
      console.log('Commands:');
      console.log('  migrate  - Migrate JSON files to Elasticsearch (default)');
      console.log('  stats    - Show Elasticsearch statistics');
      console.log('  test     - Test search functionality');
      console.log('  reset    - Delete and recreate index');
      process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});