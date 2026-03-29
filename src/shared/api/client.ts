/*
MODULE_CONTRACT: Provide the single typed HTTP client for frontend shared API access.
SCOPE: Axios instance creation, auth token attachment, and 401 handling for admin login redirect.
DEPENDS: axios, import.meta.env, localStorage, window.location
LINKS: [M-FE-SHARED-API][shared-api][BLOCK_DEFINE_CLIENT]

MODULE_MAP:
- client - Public export declared in this module.
CONTRACT:
PURPOSE: Execute the typed transport behavior described by MODULE_CONTRACT.
INPUTS: Function parameters passed to the exported API helpers in this module.
OUTPUTS: Typed Promise results or transport metadata returned by the exported helpers.
SIDE_EFFECTS: HTTP requests through the shared client or mocked adapters in tests.
START_BLOCK_MODULE
Shared HTTP client contract for all frontend transport helpers in this module.
END_BLOCK_MODULE
START_BLOCK_AUTH_INTERCEPTOR
Attach the admin bearer token to outgoing requests when it exists.
END_BLOCK_AUTH_INTERCEPTOR
START_BLOCK_ERROR_INTERCEPTOR
Clear stale auth state and redirect to the admin login screen on HTTP 401 only.
END_BLOCK_ERROR_INTERCEPTOR
CHANGE_SUMMARY: Initial shared client implementation with auth and 401 recovery.
*/
import axios, {
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const ADMIN_TOKEN_KEY = 'kodex_admin_token';
const ADMIN_LOGIN_PATH = '/admin/login';
const REQUEST_TIMEOUT_MS = 10_000;

function getStoredAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function attachAdminToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = getStoredAdminToken();

  if (!token) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers);
  headers.set('Authorization', `Bearer ${token}`);

  return {
    ...config,
    headers,
  };
}

function redirectToAdminLogin(): void {
  location.assign(ADMIN_LOGIN_PATH);
}

function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

client.interceptors.request.use(attachAdminToken);

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = typeof error === 'object' && error !== null && 'response' in error
      ? (error as { response?: { status?: number } }).response?.status
      : undefined;

    if (status === 401) {
      clearAdminToken();
      redirectToAdminLogin();
    }

    return Promise.reject(error);
  },
);
