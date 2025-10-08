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
- Update documentation as needed
- Ensure all tests pass before submitting PR

## License

MIT

## Contact

For questions or support, please open an issue on GitHub.
