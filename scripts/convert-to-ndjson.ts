#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { DiscordMessage } from '../shared/schema';

/**
 * Converts JSON message files to NDJSON format for Elasticsearch Cloud upload
 * Each line contains one JSON document for efficient bulk indexing
 */
async function convertToNDJSON(): Promise<void> {
  const dataDir = join(process.cwd(), 'client', 'src', 'data');
  const outputFile = join(process.cwd(), 'discord_messages_for_elasticsearch.ndjson');
  
  console.log('🔄 Converting JSON files to NDJSON format for Elasticsearch Cloud...');
  
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));
  console.log(`📂 Found ${files.length} JSON files to convert`);
  
  let totalMessages = 0;
  let ndjsonLines: string[] = [];
  
  for (const file of files) {
    try {
      const filePath = join(dataDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const messages = JSON.parse(content) as DiscordMessage[];
      
      console.log(`📄 Processing ${messages.length} messages from ${file}`);
      
      // Convert each message to NDJSON format
      for (const message of messages) {
        // Validate message has required fields
        if (!message.message_id || !message.author_id || !message.channel_id || !message.guild_id) {
          console.warn(`⚠️ Skipping invalid message: ${JSON.stringify(message)}`);
          continue;
        }
        
        // Create index action line
        const indexAction = {
          index: {
            _index: 'discord-messages',
            _id: message.message_id
          }
        };
        
        // Create document line with enhanced fields for search
        const document = {
          ...message,
          content_length: message.content.length,
          has_content: message.content.length > 0,
          timestamp: new Date(message.timestamp).toISOString(),
          // Add searchable fields
          author_name: message.author_id, // Will be enriched with actual names later
          channel_name: message.channel_id,
          guild_name: message.guild_id
        };
        
        // Add both lines to NDJSON
        ndjsonLines.push(JSON.stringify(indexAction));
        ndjsonLines.push(JSON.stringify(document));
        totalMessages++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  // Write NDJSON file
  const ndjsonContent = ndjsonLines.join('\n') + '\n';
  writeFileSync(outputFile, ndjsonContent, 'utf-8');
  
  console.log(`✅ Created NDJSON file: ${outputFile}`);
  console.log(`📊 Total messages converted: ${totalMessages.toLocaleString()}`);
  console.log(`📄 File size: ${(ndjsonContent.length / 1024 / 1024).toFixed(2)} MB`);
  
  // Show sample format
  console.log('\n📝 Sample NDJSON format:');
  console.log(ndjsonLines.slice(0, 4).join('\n'));
  
  console.log('\n🎯 Next steps for Elasticsearch Cloud:');
  console.log('1. Go to Kibana > Machine Learning > Data Visualizer');
  console.log('2. Upload the generated NDJSON file');
  console.log('3. Set data format to "JSON Lines" (NDJSON)');
  console.log('4. Configure index name as "discord-messages"');
  console.log('5. Review field mappings and click "Import"');
}

// Create a simple JSON format (one document per line) for easier upload
async function createSimpleNDJSON(): Promise<void> {
  const dataDir = join(process.cwd(), 'client', 'src', 'data');
  const outputFile = join(process.cwd(), 'discord_messages_simple.ndjson');
  
  console.log('🔄 Creating simple NDJSON format...');
  
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));
  let totalMessages = 0;
  let ndjsonLines: string[] = [];
  
  for (const file of files) {
    try {
      const filePath = join(dataDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const messages = JSON.parse(content) as DiscordMessage[];
      
      for (const message of messages) {
        if (!message.message_id || !message.author_id || !message.channel_id || !message.guild_id) {
          continue;
        }
        
        // Simple document format - one JSON object per line
        const document = {
          message_id: message.message_id,
          content: message.content,
          author_id: message.author_id,
          channel_id: message.channel_id,
          guild_id: message.guild_id,
          timestamp: new Date(message.timestamp).toISOString(),
          content_length: message.content.length,
          has_content: message.content.length > 0
        };
        
        ndjsonLines.push(JSON.stringify(document));
        totalMessages++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  writeFileSync(outputFile, ndjsonLines.join('\n') + '\n', 'utf-8');
  
  console.log(`✅ Created simple NDJSON file: ${outputFile}`);
  console.log(`📊 Total messages: ${totalMessages.toLocaleString()}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const format = args[0] || 'simple';
  
  switch (format) {
    case 'bulk':
      await convertToNDJSON();
      break;
    case 'simple':
      await createSimpleNDJSON();
      break;
    default:
      console.log('Usage: tsx scripts/convert-to-ndjson.ts [format]');
      console.log('Formats:');
      console.log('  simple - One JSON document per line (recommended for upload)');
      console.log('  bulk   - Bulk API format with index actions');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Conversion failed:', error);
  process.exit(1);
});