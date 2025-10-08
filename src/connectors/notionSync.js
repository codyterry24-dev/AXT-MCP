/**
 * Notion Sync Connector for AXT-MCP
 * 
 * This module provides functionality to sync data between Notion and the MCP.
 * It handles fetching and pushing records (e.g., use case datasets) to/from Notion databases.
 * 
 * @module notionSync
 */

const { Client } = require('@notionhq/client');

/**
 * Configuration for Notion API
 * 
 * Required environment variables:
 * - NOTION_API_KEY: Your Notion integration token
 * - NOTION_DATABASE_ID: The ID of your Notion database
 * 
 * API Reference: https://developers.notion.com/
 */
const notionConfig = {
  apiKey: process.env.NOTION_API_KEY || '',
  databaseId: process.env.NOTION_DATABASE_ID || '',
};

// Initialize Notion client
let notion = null;

function initializeClient() {
  if (!notionConfig.apiKey) {
    throw new Error('NOTION_API_KEY environment variable is required');
  }
  notion = new Client({ auth: notionConfig.apiKey });
  return notion;
}

/**
 * Fetch records from a Notion database
 * 
 * @param {string} databaseId - The Notion database ID
 * @param {object} filter - Optional filter for querying specific records
 * @returns {Promise<Array>} Array of database records
 * 
 * Example usage:
 * const records = await fetchNotionRecords('your-database-id', {
 *   property: 'Status',
 *   select: { equals: 'Active' }
 * });
 * 
 * API Docs: https://developers.notion.com/reference/post-database-query
 */
async function fetchNotionRecords(databaseId, filter = null) {
  if (!notion) initializeClient();

  try {
    const query = {
      database_id: databaseId || notionConfig.databaseId,
    };

    if (filter) {
      query.filter = filter;
    }

    const response = await notion.databases.query(query);
    return response.results.map(page => ({
      id: page.id,
      properties: page.properties,
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
    }));
  } catch (error) {
    console.error('Error fetching Notion records:', error);
    throw error;
  }
}

/**
 * Push (create or update) a record to Notion
 * 
 * @param {string} databaseId - The Notion database ID
 * @param {object} data - Record data to push (properties object)
 * @param {string} pageId - Optional page ID for updates (null for creation)
 * @returns {Promise<object>} The created/updated page object
 * 
 * Example usage:
 * const newRecord = await pushNotionRecord('your-database-id', {
 *   'Name': { title: [{ text: { content: 'Use Case 1' } }] },
 *   'Status': { select: { name: 'Active' } },
 *   'Description': { rich_text: [{ text: { content: 'Description here' } }] }
 * });
 * 
 * API Docs:
 * - Create: https://developers.notion.com/reference/post-page
 * - Update: https://developers.notion.com/reference/patch-page
 */
async function pushNotionRecord(databaseId, data, pageId = null) {
  if (!notion) initializeClient();

  try {
    if (pageId) {
      // Update existing page
      const response = await notion.pages.update({
        page_id: pageId,
        properties: data,
      });
      return response;
    } else {
      // Create new page
      const response = await notion.pages.create({
        parent: { database_id: databaseId || notionConfig.databaseId },
        properties: data,
      });
      return response;
    }
  } catch (error) {
    console.error('Error pushing Notion record:', error);
    throw error;
  }
}

/**
 * Sync records bidirectionally between Notion and MCP
 * 
 * @param {object} options - Sync configuration
 * @param {string} options.databaseId - Notion database ID
 * @param {string} options.direction - 'pull', 'push', or 'bidirectional'
 * @param {Array} options.mcpRecords - Local MCP records for pushing
 * @returns {Promise<object>} Sync results summary
 * 
 * Example usage:
 * const syncResults = await syncNotionData({
 *   databaseId: 'your-database-id',
 *   direction: 'bidirectional',
 *   mcpRecords: localDataset
 * });
 */
async function syncNotionData(options) {
  const { databaseId, direction = 'pull', mcpRecords = [] } = options;
  const results = {
    pulled: [],
    pushed: [],
    errors: [],
  };

  try {
    if (direction === 'pull' || direction === 'bidirectional') {
      // Fetch records from Notion
      results.pulled = await fetchNotionRecords(databaseId);
      console.log(`Pulled ${results.pulled.length} records from Notion`);
    }

    if (direction === 'push' || direction === 'bidirectional') {
      // Push MCP records to Notion
      for (const record of mcpRecords) {
        try {
          const pushed = await pushNotionRecord(
            databaseId,
            record.properties,
            record.notionPageId || null
          );
          results.pushed.push(pushed);
        } catch (error) {
          results.errors.push({ record, error: error.message });
        }
      }
      console.log(`Pushed ${results.pushed.length} records to Notion`);
    }

    return results;
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}

/**
 * Helper: Transform MCP use case data to Notion format
 * 
 * Adapt this function based on your specific Notion database schema
 * 
 * @param {object} useCaseData - MCP use case record
 * @returns {object} Notion-formatted properties object
 */
function transformMCPToNotion(useCaseData) {
  return {
    'Name': {
      title: [{ text: { content: useCaseData.name || 'Untitled' } }]
    },
    'Description': {
      rich_text: [{ text: { content: useCaseData.description || '' } }]
    },
    'Status': {
      select: { name: useCaseData.status || 'Draft' }
    },
    'Tags': {
      multi_select: (useCaseData.tags || []).map(tag => ({ name: tag }))
    },
    // Add more fields as needed based on your schema
  };
}

/**
 * Helper: Transform Notion data to MCP format
 * 
 * @param {object} notionPage - Notion page object
 * @returns {object} MCP-formatted record
 */
function transformNotionToMCP(notionPage) {
  const props = notionPage.properties;
  return {
    notionPageId: notionPage.id,
    name: props.Name?.title?.[0]?.text?.content || '',
    description: props.Description?.rich_text?.[0]?.text?.content || '',
    status: props.Status?.select?.name || '',
    tags: props.Tags?.multi_select?.map(tag => tag.name) || [],
    createdAt: notionPage.createdTime,
    updatedAt: notionPage.lastEditedTime,
    // Add more field mappings as needed
  };
}

module.exports = {
  initializeClient,
  fetchNotionRecords,
  pushNotionRecord,
  syncNotionData,
  transformMCPToNotion,
  transformNotionToMCP,
};
