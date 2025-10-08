# AXT-MCP

MCP service registry and connector framework for AXT.

## Purpose

AXT-MCP is a Model Context Protocol (MCP) implementation designed to provide a flexible service registry and connector framework. It enables seamless integration with multiple services and models through a standardized API interface.

## Setup

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

```bash
npm install
```

### Configuration

Edit `mcp.config.yaml` to configure your service registry and model settings.

### Running the Server

```bash
npm start
```

The server will start on the default port (3000) or the port specified in your environment variables.

## Supported Connectors

Connectors are located in `/src/connectors/`. Currently, the framework supports extensible connector architecture for:

- Custom service adapters
- API integrations
- Model registries

Additional connectors can be added by implementing the connector interface.

## API Reference

### Endpoints

API routes are defined in `/src/routes/`. The framework provides a RESTful API structure:

- Health check endpoint
- Registry operations
- Connector management

Detailed API documentation will be added as routes are implemented.

## Syncing with Notion & Atlas

### Overview

AXT-MCP provides integration capabilities with Notion databases and MongoDB Atlas, enabling seamless synchronization of use case datasets and other structured data across platforms.

### Notion Integration

The Notion connector (`src/connectors/notionSync.js`) provides bidirectional sync functionality:

#### Setup

1. **Create a Notion Integration**
   - Go to https://www.notion.so/my-integrations
   - Create a new integration and copy your API token
   - Share your target database with the integration

2. **Configure Environment Variables**
   ```bash
   NOTION_API_KEY=your_notion_integration_token
   NOTION_DATABASE_ID=your_database_id
   ```

3. **Update mcp.config.yaml**
   - Add your Notion workspace configuration (see config file for details)

#### Usage

```javascript
const { syncNotionData, fetchNotionRecords, pushNotionRecord } = require('./src/connectors/notionSync');

// Fetch records from Notion
const records = await fetchNotionRecords('your-database-id');

// Push a record to Notion
const newRecord = await pushNotionRecord('your-database-id', {
  'Name': { title: [{ text: { content: 'Use Case 1' } }] },
  'Status': { select: { name: 'Active' } }
});

// Bidirectional sync
const syncResults = await syncNotionData({
  databaseId: 'your-database-id',
  direction: 'bidirectional',
  mcpRecords: localDataset
});
```

#### API References

- **Notion API Documentation**: https://developers.notion.com/
- **Query Database**: https://developers.notion.com/reference/post-database-query
- **Create Page**: https://developers.notion.com/reference/post-page
- **Update Page**: https://developers.notion.com/reference/patch-page

### Atlas Integration

MongoDB Atlas integration enables cloud-based data persistence and advanced querying:

#### Setup

1. **Create an Atlas Cluster**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a new cluster (free tier available)
   - Whitelist your IP address

2. **Configure Connection String**
   ```bash
   ATLAS_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```

3. **Add Atlas Configuration to mcp.config.yaml**
   - See the `atlas` section in the config file

#### Usage

```javascript
// Atlas connector to be implemented in src/connectors/atlasSync.js
// Follow similar pattern as notionSync.js
```

### Cross-Platform Workflow

For seamless data flow across platforms:

1. **Notion → MCP → Atlas**
   - Fetch structured data from Notion databases
   - Transform and validate through MCP
   - Store in Atlas for analytics and persistence

2. **Atlas → MCP → Notion**
   - Query processed data from Atlas
   - Transform to Notion format
   - Push updates back to Notion for team collaboration

### Automation Notes

#### Scheduled Syncs

Use cron jobs or task schedulers to automate regular syncs:

```javascript
// Example: Sync every hour
const cron = require('node-cron');

cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled Notion sync...');
  await syncNotionData({
    databaseId: process.env.NOTION_DATABASE_ID,
    direction: 'bidirectional'
  });
});
```

#### Webhook Integration

For real-time syncs, consider implementing webhooks:
- Notion doesn't natively support webhooks, but you can poll for changes
- Atlas supports change streams for real-time data updates

#### Error Handling

- All sync operations include error tracking
- Failed records are logged in the sync results
- Implement retry logic for transient failures

#### Best Practices

- **Rate Limiting**: Respect Notion API rate limits (3 requests per second)
- **Incremental Syncs**: Use timestamps to sync only changed records
- **Data Validation**: Validate data schemas before pushing
- **Backup**: Maintain backups before bulk operations
- **Monitoring**: Log all sync operations for audit trails

### Additional Resources

- Notion API SDK: `npm install @notionhq/client`
- MongoDB Node Driver: `npm install mongodb`
- Environment Variables: Use `.env` files with `dotenv` package

## Contributing

We welcome contributions to AXT-MCP! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Create a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
