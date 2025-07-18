import { Client } from '@elastic/elasticsearch';

const debugElasticsearchAuth = async () => {
  console.log('🔍 Debugging Elasticsearch authentication...');
  
  const cloudId = process.env.ELASTICSEARCH_CLOUD_ID;
  const username = process.env.ELASTICSEARCH_USERNAME;
  const password = process.env.ELASTICSEARCH_PASSWORD;
  
  console.log('Environment variables:');
  console.log('- ELASTICSEARCH_CLOUD_ID length:', cloudId?.length);
  console.log('- ELASTICSEARCH_USERNAME:', username);
  console.log('- ELASTICSEARCH_PASSWORD length:', password?.length);
  console.log('- Cloud ID format valid:', cloudId?.includes(':'));
  
  if (!cloudId || !username || !password) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  // Try different client configurations
  const configs = [
    {
      name: 'Basic Auth',
      config: {
        cloud: { id: cloudId },
        auth: {
          username: username,
          password: password,
        },
      },
    },
    {
      name: 'Node Config',
      config: {
        node: `https://${cloudId.split(':')[1]}`,
        auth: {
          username: username,
          password: password,
        },
      },
    },
  ];
  
  for (const { name, config } of configs) {
    console.log(`\n🔧 Testing ${name}...`);
    try {
      const client = new Client(config);
      const response = await client.ping();
      console.log(`✅ ${name} successful:`, response);
      
      // Test cluster info
      const info = await client.info();
      console.log(`📊 ${name} cluster info:`, info.name, info.version.number);
      
      return; // Success, stop testing
    } catch (error: any) {
      console.log(`❌ ${name} failed:`, error.message);
      if (error.meta) {
        console.log(`- Status: ${error.meta.statusCode}`);
        console.log(`- Headers:`, error.meta.headers);
      }
    }
  }
  
  console.log('\n💡 All configurations failed. Common issues:');
  console.log('1. Password might be incorrect - try resetting it');
  console.log('2. Cloud ID might be malformed');
  console.log('3. Deployment might be sleeping or unhealthy');
  console.log('4. Username should be exactly "elastic"');
};

debugElasticsearchAuth().catch(console.error);