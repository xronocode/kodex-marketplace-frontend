/*
MODULE_CONTRACT: Verify the shared agent search transport contract.
SCOPE: Typed response passthrough and interpreted query header extraction.
DEPENDS: ./agentApi, ./client, vitest
LINKS: [M-FE-SHARED-API][shared-api][BLOCK_TEST_AGENT_API]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the shared agent API transport helper.
END_BLOCK_MODULE
START_BLOCK_TYPED_RESULT_TEST
Assert the helper preserves the caller-provided data shape.
END_BLOCK_TYPED_RESULT_TEST
START_BLOCK_INTERPRETED_HEADER_TEST
Assert the x-query-interpreted header is extracted from the response.
END_BLOCK_INTERPRETED_HEADER_TEST
CHANGE_SUMMARY: Tests for generic agent search and header capture.
*/
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';

type AdapterResponse = {
  data: unknown;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: InternalAxiosRequestConfig;
  request: unknown;
};

async function loadAgentApi() {
  vi.resetModules();
  return import('./agentApi');
}

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('agentSearch', () => {
  it('returns typed data and the interpreted query header', async () => {
    vi.stubEnv('VITE_AGENT_SEARCH_URL', '/v1/agent/search');

    const { agentSearch } = await loadAgentApi();
    const observedRequests: Array<{ url?: string; data?: unknown }> = [];

    const clientModule = await import('./client');
    clientModule.client.defaults.adapter = async (config): Promise<AdapterResponse> => {
      observedRequests.push({
        url: config.url,
        data: config.data,
      });

      return {
        data: {
          items: [
            { id: 'p-1', name: 'Alpha' },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {
          'x-query-interpreted': 'interpreted search',
        },
        config,
        request: {},
      };
    };

    const result = await agentSearch<{
      items: Array<{ id: string; name: string }>;
    }>('alpha');

    expect(result.data.items[0]).toEqual({
      id: 'p-1',
      name: 'Alpha',
    });
    expect(result.interpretedIntent).toBe('interpreted search');
    expect(observedRequests).toEqual([
      {
        url: '/v1/agent/search',
        data: JSON.stringify({ limit: 10, query: 'alpha' }),
      },
    ]);
  });

  it('returns null when the interpreted header is absent', async () => {
    vi.stubEnv('VITE_AGENT_SEARCH_URL', '/v1/agent/search');

    const { agentSearch } = await loadAgentApi();
    const clientModule = await import('./client');

    clientModule.client.defaults.adapter = async (config): Promise<AdapterResponse> => ({
      data: { items: [] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    });

    const result = await agentSearch<{ items: unknown[] }>('beta', 25);

    expect(result.interpretedIntent).toBeNull();
  });
});
