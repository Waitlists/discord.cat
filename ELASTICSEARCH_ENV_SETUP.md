# Elasticsearch Cloud Environment Variables Setup

## Required Environment Variables

To connect your Discord Message Viewer to Elasticsearch Cloud, you need to set these three environment variables in Replit:

### 1. ELASTICSEARCH_CLOUD_ID
- **Key**: `ELASTICSEARCH_CLOUD_ID`
- **Value**: Your Elasticsearch Cloud deployment ID
- **Format**: `deployment-name:base64-encoded-endpoint`
- **Example**: `my-deployment:dXMtZWFzdC0xLmF3cy5mb3VuZC5pbyRjZWM2...`

### 2. ELASTICSEARCH_USERNAME
- **Key**: `ELASTICSEARCH_USERNAME`
- **Value**: `elastic`
- **Note**: This is the default superuser account name

### 3. ELASTICSEARCH_PASSWORD
- **Key**: `ELASTICSEARCH_PASSWORD`
- **Value**: Your deployment password
- **Note**: This is the password you set when creating the deployment

## How to Set Up in Replit

1. **Open Replit Secrets**:
   - Click the lock icon (🔒) in the left sidebar
   - Or go to the "Secrets" tab in your Replit project

2. **Add Each Secret**:
   - Click "New Secret" for each variable
   - Enter the exact key name and value

3. **Get Your Elasticsearch Cloud Credentials**:
   - Go to [cloud.elastic.co](https://cloud.elastic.co/deployments)
   - Click on your deployment
   - Copy the **Cloud ID** from the deployment overview
   - Use `elastic` as the username
   - Use your deployment password (reset if needed)

## Replit Secrets Configuration

```
Secret Name: ELASTICSEARCH_CLOUD_ID
Secret Value: your-deployment:base64-encoded-endpoint

Secret Name: ELASTICSEARCH_USERNAME  
Secret Value: elastic

Secret Name: ELASTICSEARCH_PASSWORD
Secret Value: your-deployment-password
```

## How to Get Your Cloud ID

1. **Login to Elastic Cloud**: https://cloud.elastic.co/deployments
2. **Select Your Deployment**: Click on your deployment name
3. **Copy Cloud ID**: 
   - Look for "Cloud ID" in the deployment overview
   - Click the copy button (don't type it manually)
   - It should look like: `my-deployment:dXMtZWFzdC0xLmF3cy5mb3VuZC5pbyRjZWM2...`

## How to Get/Reset Your Password

1. **In your deployment page**, go to the "Security" tab
2. **Find the "elastic" user**
3. **Click "Reset password"** if you don't remember it
4. **Copy the new password** immediately
5. **Paste it into the Replit secret**

## Testing the Connection

After setting up the environment variables:

1. **Restart your Replit**: Stop and start your application
2. **Check the logs**: Look for Elasticsearch connection messages
3. **Visit your app**: The Elasticsearch status indicator should show "Connected"
4. **Test search**: Try searching for messages

## Troubleshooting

### Common Issues:

1. **401 Authentication Error**:
   - Password is incorrect or expired
   - Reset password in Elastic Cloud console

2. **Cloud ID Format Error**:
   - Make sure you copied the complete Cloud ID
   - It should contain a colon (`:`) in the middle

3. **Connection Timeout**:
   - Check if your deployment is active (not sleeping)
   - Verify your deployment is healthy in Elastic Cloud

### Success Indicators:

- ✅ Elasticsearch status shows "Connected" in the top-right
- ✅ Search returns results in milliseconds
- ✅ Statistics show your message counts
- ✅ No error messages in the console

## Alternative: API Key Authentication (Optional)

If you prefer API key authentication:

1. **Create API Key** in Elastic Cloud:
   - Go to Security → API Keys
   - Create new key with `superuser` role

2. **Replace the three secrets above with**:
   ```
   ELASTICSEARCH_CLOUD_ID: your-cloud-id
   ELASTICSEARCH_API_KEY: your-api-key
   ```

3. **Remove** username and password secrets

The application will automatically detect and use API key authentication if available.