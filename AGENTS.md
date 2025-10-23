# AXT-MCP Agent Guidelines

This document explains how to work with the AXT-MCP agent configuration, including setup steps, initialization scripts, and integration practices for Codex-based workspaces. These notes apply to every file in this repository.

## 1. Repository Overview

- **Primary entrypoint:** `src/index.js` exposes the Express server that provides MCP endpoints (`/`, `/health`, `/registry`, and `/connectors`).
- **Configuration:** `mcp.config.yaml` controls registry metadata, server defaults, connector discovery, and logging/security settings.
- **Connectors:** Place connector implementations in `src/connectors/`. The provided `notionSync.js` illustrates the connector interface, Notion API usage, and data transformation helpers.
- **Routes:** API route handlers belong under `src/routes/` (the directory is currently a placeholder with `.gitkeep`).
- **Automation data:** CSV/JSON artefacts (`axt_project_threads.*`) provide reference datasets for synchronization scenarios.

## 2. Agent Setup

1. **Node environment**
   - Requires Node.js `>=16.0.0` (see `package.json > engines`).
   - Install dependencies with `npm install` (uses `express` at runtime, `nodemon` and `eslint` for development tooling).
2. **Environment variables**
   - Connector-specific values are sourced from the shell. For the Notion connector set:
     ```bash
     export NOTION_API_KEY="<integration token>"
     export NOTION_DATABASE_ID="<target database id>"
     ```
   - Add additional variables as connectors require (follow the pattern in each connector module).
3. **Configuration file**
   - Duplicate `mcp.config.yaml` when branching or add environment-specific overrides.
   - Key sections:
     - `registry`: human-readable metadata for the MCP service registry.
     - `server`: host/port defaults; override via `HOST`/`PORT` env vars at runtime.
     - `services` & `models`: registry entries for downstream services/models (examples are commented for guidance).
     - `connectors`: `autoload: true` instructs the runtime to load every module under `src/connectors`.
     - `logging` & `security`: tune request logging format and CORS/rate-limiting defaults for deployments.

## 3. Initialization & Runtime Scripts

The `package.json` scripts streamline common workflows:

| Script | Command | Purpose |
| --- | --- | --- |
| `start` | `npm start` | Launches the MCP server (`node src/index.js`). Use for production or manual testing. |
| `dev` | `npm run dev` | Runs the server via `nodemon` for autoreload during development sessions. |
| `lint` | `npm run lint` | Executes ESLint across `src/**/*.js`. Configure `.eslintrc` to enforce project standards. |
| `test` | `npm test` | Placeholder (currently exits with status 1). Replace with a real test runner when adding coverage. |

To initialize the agent locally or within a Codex workspace:

```bash
npm install
npm run dev
# or npm start for a static session
```

The server prints the resolved host/port and exposes a `/health` endpoint with status metadata for readiness probes.

## 4. Connector Development Workflow

- Use `notionSync.js` as a template for new connectors: initialize clients lazily, expose CRUD helpers, and provide transformation utilities between MCP records and external schemas.
- Catch and rethrow external API errors with context (see the `console.error` calls inside `fetchNotionRecords` and `pushNotionRecord`).
- When introducing connectors that require credentials, document the required environment variables in this file and add schema comments inside the connector module.
- Align new connectors with the autoload expectation—export functions that can be imported dynamically by the runtime or future registry loaders.

## 5. Codex Workspace Integration

When operating inside a Codex (OpenAI) workspace or similar cloud IDE:

1. **Workspace bootstrap**
   - Clone or mount the repository under `/workspace/AXT-MCP`.
   - Run `npm install` once per workspace to hydrate `node_modules/`.
2. **Agent initialization**
   - Source environment variables in the shell startup script (e.g., append exports to `~/.bashrc` or the workspace-specific init file).
   - Launch the MCP service with `npm run dev` to benefit from hot reload while iterating through Codex prompts.
3. **Port forwarding & health checks**
   - Ensure the workspace forwards the selected port (default `3000`). Use `curl http://localhost:3000/health` to verify readiness.
4. **Automated tasks**
   - For scripted initialization, create workspace init hooks that execute `npm install` (if `node_modules` is absent) followed by the desired start command.
   - Store Codex automation scripts under a dedicated directory (e.g., `scripts/`) if the project grows; document them here to keep the workspace bootstrap reproducible.

## 6. Contribution Notes

- Follow the repository-wide lint rules (`npm run lint`) before committing.
- Provide environment-variable documentation for every connector or script you add.
- Update this `AGENTS.md` whenever the setup workflow changes (new scripts, additional services, etc.).

By adhering to these conventions, contributors can reliably configure and operate the AXT-MCP agent across local machines and Codex-based environments.
