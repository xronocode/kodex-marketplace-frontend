# Kodex Frontend

Vue 3 + TypeScript frontend for Kodex marketplace prototype.
Architecture: Feature-Sliced Design (FSD).

## Stack

Vue 3.5.x, TypeScript 5.x, Vite 6.x, Vue Router 4.x,
Pinia 2.x, Axios 1.x.

## Run (via Docker Compose)

See `../kodex-infra/README.md` for the recommended full-stack start.

## Run standalone (development)

```bash
cd kodex-frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:8000
npm run dev            # http://localhost:5173
```

## Run tests

```bash
npm exec vitest run    # unit + component tests
npm run type-check     # TypeScript validation
npm run lint           # ESLint check
```

## FSD architecture

```
src/
  app/          router, Pinia setup, App.vue
  pages/        CatalogPage, ProductPage, AdminPage, LoginPage
  widgets/      ProductCard, ProductModal, ProductsTable
  features/     useInfiniteScroll, useSortOffers,
                useAdminAuth, useVoiceSearch
  entities/     product, offer, seller (types + API calls)
  shared/       axios client, UI components, utilities
```

Import rules: each layer may only import from layers below it.
Cross-slice internal imports are forbidden (ESLint enforced).

## Features

- Infinite scroll catalog with 100+ products
- Product detail modal with offer sorting (price / delivery date)
- Natural language agent search (POST /v1/agent/search)
- Voice search via Web Speech API (graceful fallback if unavailable)
- Admin panel: product CRUD, image upload, offer management
- Bearer JWT auth for admin routes
