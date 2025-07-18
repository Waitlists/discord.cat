import { Client } from '@elastic/elasticsearch';

const testApiKey = async () => {
  console.log('🔧 Testing Elasticsearch API Key Authentication');
  console.log('================================================\n');
  
  const cloudId = process.env.ELASTICSEARCH_CLOUD_ID;
  const apiKey = process.env.ELASTICSEARCH_API_KEY;
  const username = process.env.ELASTICSEARCH_USERNAME;
  const password = process.env.ELASTICSEARCH_PASSWORD;
  
  console.log('Environment check:');
  console.log(`- Cloud ID: ${cloudId ? 'Set' : 'Missing'} (${cloudId?.length || 0} chars)`);
  console.log(`- API Key: ${apiKey ? 'Set' : 'Missing'} (${apiKey?.length || 0} chars)`);
  console.log(`- Username: ${username ? 'Set' : 'Missing'}`);
  console.log(`- Password: ${password ? 'Set' : 'Missing'}`);
  
  if (!cloudId) {
    console.log('\n❌ Cloud ID is required');
    return;
  }
  
  if (apiKey) {
    console.log('\n🔑 Testing API Key authentication...');
    try {
      const client = new Client({
        cloud: { id: cloudId },
        auth: { apiKey }
      });
      
      const response = await client.ping();
      console.log('✅ API Key authentication successful!');
      
      // Test cluster info
      const info = await client.info();
      console.log(`📊 Cluster: ${info.name}`);
      console.log(`📊 Version: ${info.version.number}`);
      
      // Test search
      const search = await client.search({
        index: 'discord-messages',
        body: { query: { match_all: {} }, size: 1 }
      });
      console.log(`📊 Messages in index: ${search.hits.total.value}`);
      
      return true;
    } catch (error: any) {
      console.log('❌ API Key authentication failed');
      console.log(`Error: ${error.message}`);
      console.log(`Status: ${error.meta?.statusCode || 'Unknown'}`);
      return false;
    }
  } else if (username && password) {
    console.log('\n🔐 Testing Username/Password authentication...');
    try {
      const client = new Client({
        cloud: { id: cloudId },
        auth: { username, password }
      });
      
      const response = await client.ping();
      console.log('✅ Username/Password authentication successful!');
      
      // Test cluster info
      const info = await client.info();
      console.log(`📊 Cluster: ${info.name}`);
      console.log(`📊 Version: ${info.version.number}`);
      
      return true;
    } catch (error: any) {
      console.log('❌ Username/Password authentication failed');
      console.log(`Error: ${error.message}`);
      console.log(`Status: ${error.meta?.statusCode || 'Unknown'}`);
      return false;
    }
  } else {
    console.log('\n❌ No authentication method available');
    console.log('Please set either:');
    console.log('- ELASTICSEARCH_API_KEY (recommended)');
    console.log('- ELASTICSEARCH_USERNAME and ELASTICSEARCH_PASSWORD');
    return false;
  }
};

testApiKey().catch(console.error);