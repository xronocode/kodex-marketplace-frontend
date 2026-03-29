/*
MODULE_CONTRACT: Provide the admin auth composable for login, logout, token persistence, and redirects.
SCOPE: Login state, localStorage token synchronization, router navigation, and stable failure messaging.
DEPENDS: @/shared/api, vue-router, vue
LINKS: [AdminAuthFeature][login][BLOCK_SUBMIT_LOGIN]

MODULE_MAP:
- useAdminAuth - Public export declared in this module.
- AdminLoginCredentials - Public export declared in this module.
CONTRACT:
PURPOSE: Execute the composable behavior described by MODULE_CONTRACT.
INPUTS: Function parameters plus reactive, browser, or transport dependencies declared in this module.
OUTPUTS: Reactive state objects and helper functions returned by the composable.
SIDE_EFFECTS: Reactive state mutation, browser API access, and optional HTTP calls.
START_BLOCK_MODULE
Admin auth composable boundary for the frontend feature module.
END_BLOCK_MODULE
START_BLOCK_SUBMIT_LOGIN
Submit admin credentials, persist the access token, and navigate to the admin shell.
END_BLOCK_SUBMIT_LOGIN
START_BLOCK_SUBMIT_LOGOUT
Clear the stored token and return the user to the admin login screen.
END_BLOCK_SUBMIT_LOGOUT
CHANGE_SUMMARY: Implements admin login/logout state, token persistence, and redirect behavior.
*/
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { client } from '@/shared/api';

const ADMIN_TOKEN_KEY = 'kodex_admin_token';
const ADMIN_LOGIN_PATH = '/v1/admin/auth/login';
const ADMIN_ROOT_PATH = '/admin';
const ADMIN_LOGIN_REDIRECT_PATH = '/admin/login';
const AUTH_ERROR_MESSAGE = 'Неверный логин или пароль';

export interface AdminLoginCredentials {
  username: string;
  password: string;
}

type AdminLoginResponse = {
  access_token?: string;
};

function readStoredToken(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function storeToken(token: string): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function clearToken(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function useAdminAuth() {
  const router = useRouter();
  const token = ref<string | null>(readStoredToken());
  const error = ref<string | null>(null);
  const isAuthenticated = computed(() => Boolean(token.value));

  async function login(username: string, password: string): Promise<void> {
    error.value = null;

    try {
      const credentials: AdminLoginCredentials = {
        password,
        username,
      };
      const response = await client.post<AdminLoginResponse>(ADMIN_LOGIN_PATH, credentials);
      const accessToken = response.data.access_token;

      if (typeof accessToken !== 'string' || accessToken.length === 0) {
        throw new Error('Missing access token');
      }

      storeToken(accessToken);
      token.value = accessToken;
      await router.push(ADMIN_ROOT_PATH);
    } catch {
      clearToken();
      token.value = null;
      error.value = AUTH_ERROR_MESSAGE;
    }
  }

  async function logout(): Promise<void> {
    clearToken();
    token.value = null;
    error.value = null;
    await router.push(ADMIN_LOGIN_REDIRECT_PATH);
  }

  return {
    error,
    isAuthenticated,
    login,
    logout,
  };
}
