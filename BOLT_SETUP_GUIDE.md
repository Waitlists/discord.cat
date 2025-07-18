# Bolt Environment Setup Guide

## Setting Up Elasticsearch in Bolt

### Step 1: Get Your Elasticsearch Cloud Credentials

1. **Go to Elastic Cloud**: https://cloud.elastic.co/deployments
2. **Click on your deployment**
3. **Copy the Cloud ID** from the deployment overview page
4. **Get your password** (reset if needed in Security tab)

### Step 2: Configure Environment Variables in Bolt

1. **Edit the `.env` file** in your project root
2. **Replace the placeholder values** with your actual credentials:

```env
ELASTICSEARCH_CLOUD_ID=your-actual-cloud-id-here
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-actual-password-here
```

### Step 3: Your Credentials Format

**Cloud ID Format:**
- Should look like: `my-deployment:dXMtZWFzdC0xLmF3cy5mb3VuZC5pbyRjZWM2...`
- Contains a colon (`:`) separating deployment name from encoded endpoint

**Username:**
- Almost always: `elastic`
- This is the built-in superuser account

**Password:**
- The password you set when creating the deployment
- If forgotten, reset it in the Elastic Cloud console

### Step 4: Test the Connection

After setting up your `.env` file:

1. **Save the file**
2. **Restart your development server**
3. **Check the Elasticsearch status** in the top-right of your app
4. **Should show "Elasticsearch Connected"** if successful

### Step 5: Troubleshooting

**If you see "401 Authentication Error":**
- Your password is incorrect
- Reset it in Elastic Cloud console
- Update your `.env` file

**If you see connection errors:**
- Check your Cloud ID format
- Ensure your deployment is active (not sleeping)
- Verify all credentials are correct

### Alternative: API Key Authentication

Instead of username/password, you can use an API key:

1. **Create API Key** in Elastic Cloud (Security → API Keys)
2. **Replace in `.env`**:
```env
ELASTICSEARCH_CLOUD_ID=your-cloud-id
ELASTICSEARCH_API_KEY=your-api-key
# Remove username and password lines
```

## Your App Features

Once connected, you'll have access to:
- ⚡ Lightning-fast search across 2.2M Discord messages
- 📊 Real-time statistics and aggregations
- 🔍 Fuzzy matching and advanced filtering
- 📱 Responsive Discord-style interface
- 🌙 Dark/light theme support

## Data Scale
- **2,206,793 messages** indexed
- **425,262 unique users**
- **12 servers**
- **40-200ms response times**