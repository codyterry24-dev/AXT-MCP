/**
 * AXT-MCP Server
 * Node.js server entrypoint for MCP service registry
 */

const express = require('express');
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AXT-MCP',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AXT-MCP Service Registry',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      registry: '/registry',
      connectors: '/connectors'
    }
  });
});

// Registry endpoint placeholder
app.get('/registry', (req, res) => {
  res.json({
    message: 'Registry endpoint',
    services: [],
    models: []
  });
});

// Connectors endpoint placeholder
app.get('/connectors', (req, res) => {
  res.json({
    message: 'Connectors endpoint',
    available: [],
    loaded: []
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`AXT-MCP server running on http://${HOST}:${PORT}`);
  console.log(`Health check available at http://${HOST}:${PORT}/health`);
});

module.exports = app;
