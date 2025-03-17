# MCP Perplexity Server

## Overview

This repository contains the code for the Model Context Protocol (MCP) Perplexity Server, which is a server that provides an API to ask a question to a model behind the Perplexity API.

## Quickstart via Portainer or Docker Compose

Use the following `docker-compose.yml` to quickly set up the server via Portainer (as a stack) or Docker Compose:

```yaml
services:
  mcp-sse-server:
    image: ghcr.io/sibbl/mcp-perplexity-api:main
    ports:
      - "8080:8080"
    restart: unless-stopped
    environment:
      - MCP_TRANSPORT=sse
      - MCP_PERPLEXITY_API_KEY=ENTER_YOUR_PERPLEXITY_API_KEY
      # - MCP_SSE_AUTH_HEADER_VALUE=Bearer some_token_which_is_required # enables optional bearer authentication against the MCP server with hard coded value
```

Save it for Docker compose in a new directory and run `docker compose up` in it. `http://localhost:8080/sse` is your endpoint.

## Prerequisites

* Nodejs
* pnpm
* Docker

**Important**: Copy the `.env.sample` to `.env` and set your Perplexity API key.

## Installation via Docker

To quickly set up the server, run:

```bash
docker compose up
```

## Installation via Node.js

To install the required dependencies, run the following command:

```bash
pnpm install
```

To start the server, run:

```bash

# with stdio transport
export MCP_TRANSPORT=stdio # optional, stdio is default
pnpm start

# or

# with SSE transport
export MCP_TRANSPORT=sse
pnpm start
```

## Configuration

All configuration options:

* `MCP_PERPLEXITY_API_KEY`: Perplexity API key to use. *Required*.
* `MCP_TRANSPORT`: Either `stdio` or `sse`. Default is `stdio`.
* `MCP_PERPLEXITY_DEFAULT_MODEL`: The perplexity default model to use. Default is `sonar-pro`.
* `MCP_PERPLEXITY_MODELS`: Comma separated list of models to use. Default is `sonar,sonar-pro`.
* `MCP_PERPLEXITY_TOOL_DESCRIPTION_SUFFIX`: The suffix to use for the tool description. Empty by default.
* `MCP_SSE_ENDPOINT`: The endpoint to use for SSE. Default is `/sse`.
* `MCP_SSE_PORT`: The port to use for SSE. Default is `8080`.
* `MCP_SSE_AUTH_HEADER_KEY`: The auth header key to use for SSE. Default is `Authorization`.
* `MCP_SSE_AUTH_HEADER_VALUE`: The auth header value to use for SSE. By default no value is set, which means that no authorization is required.
