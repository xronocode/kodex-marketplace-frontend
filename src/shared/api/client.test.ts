/*
MODULE_CONTRACT: Verify the shared HTTP client contract for auth and redirect handling.
SCOPE: Base URL, timeout, auth header injection, and 401 recovery behavior.
DEPENDS: ./client, vitest
LINKS: [M-FE-SHARED-API][shared-api][BLOCK_TEST_CLIENT]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the shared HTTP client.
END_BLOCK_MODULE
START_BLOCK_BASE_URL_TEST
Assert the configured base URL and timeout are stable.
END_BLOCK_BASE_URL_TEST
START_BLOCK_AUTH_HEADER_TEST
Assert the bearer token is attached when present.
END_BLOCK_AUTH_HEADER_TEST
START_BLOCK_401_TEST
Assert 401 responses clear the token and redirect to admin login.
END_BLOCK_401_TEST
CHANGE_SUMMARY: Tests for client setup and interceptor branches.
*/
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

type AdapterResponse = {
  data: unknown;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: InternalAxiosRequestConfig;
  request: unknown;
};

async function loadClient() {
  vi.resetModules();
  return import('./client');
}

function installRedirectSpy(): ReturnType<typeof vi.fn> {
  const assign = vi.fn();

  vi.stubGlobal('location', {
    assign,
  });

  return assign;
}

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('client', () => {
  it('uses the configured base URL and timeout', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');

    const { client } = await loadClient();

    expect(client.defaults.baseURL).toBe('https://api.example.test');
    expect(client.defaults.timeout).toBe(10_000);
  });

  it('attaches the stored bearer token to outgoing requests', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
    localStorage.setItem('kodex_admin_token', 'token-123');

    const { client } = await loadClient();
    let observedAuthorization = '';

    client.defaults.adapter = async (config): Promise<AdapterResponse> => {
      observedAuthorization = String(AxiosHeaders.from(config.headers).get('Authorization') ?? '');

      return {
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      };
    };

    await client.get('/health');

    expect(observedAuthorization).toBe('Bearer token-123');
  });

  it('clears the token and redirects on 401 responses', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
    localStorage.setItem('kodex_admin_token', 'token-123');

    const redirectSpy = installRedirectSpy();
    const { client } = await loadClient();

    client.defaults.adapter = async (config): Promise<AdapterResponse> =>
      Promise.reject({
        config,
        response: {
          data: { detail: 'unauthorized' },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
          request: {},
        },
      });

    await expect(client.get('/admin')).rejects.toMatchObject({
      response: {
        status: 401,
      },
    });

    expect(localStorage.getItem('kodex_admin_token')).toBeNull();
    expect(redirectSpy).toHaveBeenCalledWith('/admin/login');
  });

  it('does not redirect for non-401 responses', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
    localStorage.setItem('kodex_admin_token', 'token-123');

    const redirectSpy = installRedirectSpy();
    const { client } = await loadClient();

    client.defaults.adapter = async (config): Promise<AdapterResponse> =>
      Promise.reject({
        config,
        response: {
          data: { detail: 'forbidden' },
          status: 403,
          statusText: 'Forbidden',
          headers: {},
          config,
          request: {},
        },
      });

    await expect(client.get('/admin')).rejects.toMatchObject({
      response: {
        status: 403,
      },
    });

    expect(localStorage.getItem('kodex_admin_token')).toBe('token-123');
    expect(redirectSpy).not.toHaveBeenCalled();
  });
});
