import { Client } from '@elastic/elasticsearch';

const fixElasticsearchAuth = async () => {
  console.log('🔧 Elasticsearch Authentication Fix Helper');
  console.log('=====================================\n');
  
  const cloudId = process.env.ELASTICSEARCH_CLOUD_ID;
  const username = process.env.ELASTICSEARCH_USERNAME;
  const password = process.env.ELASTICSEARCH_PASSWORD;
  
  console.log('Current credentials status:');
  console.log(`✅ Cloud ID: ${cloudId ? 'Set' : 'Missing'} (${cloudId?.length} chars)`);
  console.log(`✅ Username: ${username || 'Missing'}`);
  console.log(`✅ Password: ${password ? 'Set' : 'Missing'} (${password?.length} chars)`);
  
  if (!cloudId || !username || !password) {
    console.log('\n❌ Missing required credentials');
    return;
  }
  
  console.log('\n🔍 Testing current credentials...');
  
  try {
    const client = new Client({
      cloud: { id: cloudId },
      auth: { username, password }
    });
    
    const response = await client.ping();
    console.log('✅ SUCCESS! Elasticsearch is now connected');
    console.log('Response:', response);
    
    // Test basic info
    const info = await client.info();
    console.log(`📊 Cluster: ${info.name}`);
    console.log(`📊 Version: ${info.version.number}`);
    
    return true;
  } catch (error: any) {
    console.log('❌ Authentication failed with current credentials');
    console.log(`Error: ${error.message}`);
    console.log(`Status: ${error.meta?.statusCode}`);
    
    if (error.meta?.statusCode === 401) {
      console.log('\n🔧 401 Error - Authentication Issue');
      console.log('This means your password is incorrect or expired.\n');
      
      console.log('SOLUTION - Reset your password:');
      console.log('1. Go to: https://cloud.elastic.co/deployments');
      console.log('2. Click on your deployment');
      console.log('3. Go to "Security" tab');
      console.log('4. Click "Reset password" for the "elastic" user');
      console.log('5. Copy the NEW password');
      console.log('6. Update your Replit secret: ELASTICSEARCH_PASSWORD');
      console.log('7. Run this script again');
      
      console.log('\nAlternative - Use API Key:');
      console.log('1. In your deployment, go to "Security" tab');
      console.log('2. Click "Create API key"');
      console.log('3. Copy the API key');
      console.log('4. Update your Replit secrets:');
      console.log('   - Remove: ELASTICSEARCH_USERNAME');
      console.log('   - Remove: ELASTICSEARCH_PASSWORD');
      console.log('   - Add: ELASTICSEARCH_API_KEY');
    }
    
    return false;
  }
};

fixElasticsearchAuth().catch(console.error);