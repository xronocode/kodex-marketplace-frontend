/*
MODULE_CONTRACT: Define the Vue application routes and the explicit admin access guard.
SCOPE: Catalog, admin login, and guarded admin route registration only.
DEPENDS: vue-router, @/pages/catalog, @/pages/admin
LINKS: [FrontendApp][router][BLOCK_ROUTE_GUARDS]

MODULE_MAP:
- createAppRouter - Public export declared in this module.
- adminRouteGuard - Public export declared in this module.
- routes - Public export declared in this module.
- router - Public export declared in this module.
CONTRACT:
PURPOSE: Provide the governed module behavior described by MODULE_CONTRACT.
INPUTS: Module-local parameters, props, or declarations referenced below.
OUTPUTS: The exported component, helper, or typed surface declared in this file.
SIDE_EFFECTS: Local state changes and explicitly declared router, browser, or transport interactions only.
START_BLOCK_MODULE
Application router boundary for page routing and auth gating.
END_BLOCK_MODULE
START_BLOCK_ROUTE_GUARDS
Resolve the admin route with a localStorage token check before entering the admin shell.
END_BLOCK_ROUTE_GUARDS
CHANGE_SUMMARY: Adds the catalog route, the admin login route, and a guarded admin shell route.
*/
import {
  createRouter,
  createWebHistory,
  type NavigationGuard,
  type RouteRecordRaw,
  type RouterHistory,
} from 'vue-router';

import { AdminPage, LoginPage } from '@/pages/admin';
import { CatalogPage } from '@/pages/catalog';

const ADMIN_TOKEN_KEY = 'kodex_admin_token';
const ADMIN_LOGIN_PATH = '/admin/login';
const ADMIN_ROOT_PATH = '/admin';

function readAdminToken(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export const adminRouteGuard: NavigationGuard = () => {
  return readAdminToken() ? true : ADMIN_LOGIN_PATH;
};

export const routes: RouteRecordRaw[] = [
  {
    component: CatalogPage,
    path: '/',
  },
  {
    component: LoginPage,
    path: ADMIN_LOGIN_PATH,
  },
  {
    beforeEnter: adminRouteGuard,
    component: AdminPage,
    path: ADMIN_ROOT_PATH,
  },
];

export function createAppRouter(history: RouterHistory = createWebHistory()) {
  return createRouter({
    history,
    routes,
  });
}

export const router = createAppRouter();
