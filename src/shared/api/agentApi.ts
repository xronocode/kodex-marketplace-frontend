/*
MODULE_CONTRACT: Provide shared transport helpers for agent search requests.
SCOPE: Generic agent search transport, typed data passthrough, and query interpretation header capture.
DEPENDS: ./client, axios response headers
LINKS: [M-FE-SHARED-API][shared-api][BLOCK_DEFINE_AGENT_API]

MODULE_MAP:
- agentSearch - Public export declared in this module.
- AgentSearchResult - Public export declared in this module.
CONTRACT:
PURPOSE: Execute the typed transport behavior described by MODULE_CONTRACT.
INPUTS: Function parameters passed to the exported API helpers in this module.
OUTPUTS: Typed Promise results or transport metadata returned by the exported helpers.
SIDE_EFFECTS: HTTP requests through the shared client or mocked adapters in tests.
START_BLOCK_MODULE
Shared agent API transport helpers that remain transport-level and domain-neutral.
END_BLOCK_MODULE
START_BLOCK_SEARCH_HELPER
Submit agent search requests and preserve typed payloads for higher layers.
END_BLOCK_SEARCH_HELPER
START_BLOCK_HEADER_EXTRACTION
Capture the backend query interpretation hint from the `x-query-interpreted` response header.
END_BLOCK_HEADER_EXTRACTION
CHANGE_SUMMARY: Initial generic agent search helper with interpreted query extraction.
*/
import { AxiosHeaders } from 'axios';

import { client } from './client';

const DEFAULT_AGENT_SEARCH_PATH = import.meta.env.VITE_AGENT_SEARCH_URL ?? '/v1/agent/search';
const QUERY_INTERPRETED_HEADER = 'x-query-interpreted';

export interface AgentSearchResult<TData> {
  data: TData;
  interpretedIntent: string | null;
}

function readInterpretedQuery(headers: unknown): string | null {
  const value = AxiosHeaders.from(headers as never).get(QUERY_INTERPRETED_HEADER);

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return null;
}

export async function agentSearch<TData>(
  query: string,
  limit = 10,
): Promise<AgentSearchResult<TData>> {
  const response = await client.post<TData>(DEFAULT_AGENT_SEARCH_PATH, {
    limit,
    query,
  });

  return {
    data: response.data,
    interpretedIntent: readInterpretedQuery(response.headers),
  };
}
