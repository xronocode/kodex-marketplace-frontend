# Kodex Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3.5](https://img.shields.io/badge/Vue-3.5-green.svg)](https://vuejs.org/)
[![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite 6.x](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)

> **AI-Ready Marketplace Platform** — Vue 3 + TypeScript frontend with Agentic Commerce UI

Part of the **Kodex** open-source marketplace platform built entirely using AI tools under the **GRACE** methodology.

## 🚀 Features

- **Infinite Scroll Catalog** — Seamless browsing with 100+ products
- **Product Detail Modal** — Sortable offers by price or delivery date
- **Natural Language Search** — Agent-powered product discovery
- **Voice Search** — Web Speech API integration with graceful fallback
- **Admin Panel** — Full CRUD for products and offers
- **JWT Authentication** — Secure admin access
- **Feature-Sliced Design** — Scalable, maintainable architecture

## 📦 Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vue 3.5.x |
| Language | TypeScript 5.x |
| Build Tool | Vite 6.x |
| Router | Vue Router 4.x |
| State | Pinia 2.x |
| HTTP Client | Axios 1.x |
| Testing | Vitest 2.x |
| Linting | ESLint 9.x |

## 🏁 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# From the kodex-infra directory
cd ../kodex-infra
docker compose up --build
```

Frontend will be available at http://localhost:5173

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit VITE_API_BASE_URL=http://localhost:8000

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing & Quality

```bash
# Run tests
npm run test              # vitest run
npm run test:coverage     # vitest run --coverage

# Type checking
npm run type-check        # vue-tsc --noEmit

# Linting
npm run lint              # eslint .
npm run lint:fix          # eslint . --fix
```

## 🏗 Feature-Sliced Design (FSD) Architecture

```
src/
├── app/                  # Application bootstrap
│   ├── App.vue           # Root component
│   ├── router.ts         # Vue Router configuration
│   └── index.ts          # App entry point
│
├── pages/                # Route-level components
│   ├── catalog/          # Catalog page (infinite scroll)
│   ├── product/          # Product detail modal
│   └── admin/            # Admin panel + login
│
├── widgets/              # Composite components
│   ├── product-card/     # ProductCard component
│   ├── product-modal/    # ProductModal with offers
│   └── products-table/   # Admin products table
│
├── features/             # User actions & interactions
│   ├── infinite-scroll/  # useInfiniteScroll composable
│   ├── product-sort/     # useSortOffers composable
│   ├── voice-search/     # useVoiceSearch composable
│   └── admin-auth/       # useAdminAuth composable
│
├── entities/             # Domain models & API calls
│   ├── product/          # Product types + API
│   ├── offer/            # Offer types + API
│   └── seller/           # Seller types
│
└── shared/               # Shared utilities
    ├── api/              # Axios client + API methods
    ├── ui/               # Reusable UI components
    ├── lib/              # Utility functions
    └── styles/           # Global styles & tokens
```

### Import Rules

- Each layer may **only import from layers below it**
- Cross-slice internal imports are **forbidden** (ESLint enforced)
- Public API only — import through `index.ts` files

## 🎨 UI Components

### Shared UI (Primitive Components)

| Component | Description |
|-----------|-------------|
| `Button` | Primary/secondary/ghost variants |
| `Badge` | Status badges (success, warning, error) |
| `Spinner` | Loading indicator with customizable size |

### Widgets (Composite Components)

| Component | Description |
|-----------|-------------|
| `ProductCard` | Product image, title, price, delivery date |
| `ProductModal` | Full product detail with sortable offers |
| `ProductsTable` | Admin table with CRUD actions |

## 🤖 Agent Integration

The frontend integrates with the backend's Agent layer for natural language search:

```typescript
import { agentSearch } from '@/shared/api/agentApi'

const results = await agentSearch('cheap laptops delivered tomorrow')
```

See `docs/ai/AI_WORKFLOW.md` for the complete AI integration methodology.

## 🤖 AI Stack

This project was built 100% with AI coding assistants under human engineering supervision:

| Category | Tools |
|----------|-------|
| **AI IDEs** | [Antigravity](https://antigravity.ai/) / [Codex](https://openai.com/codex) / [Qwen Code](https://github.com/QwenLM/Qwen) |
| **Code Editors** | VS Code / [Kilo Code](https://kilocode.ai/) / QwenCode |
| **LLM Models** | [Claude](https://anthropic.com/) / [Gemini](https://deepmind.google/technologies/gemini/) / Qwen |

### Development Methodology

- **GRACE** (Graph-RAG Anchored Code Engineering) — Contract-first development with semantic markup
- **Human-in-the-Loop** — All AI-generated code reviewed and validated by senior engineer
- **Verification-Driven** — Every module has contracts, tests, and knowledge graph links

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🔗 Related Repositories

- **[kodex-marketplace-backend](https://github.com/xronocode/kodex-marketplace-backend)** — FastAPI backend
- **[kodex-marketplace-stack](https://github.com/xronocode/kodex-marketplace-stack)** — Docker Compose infrastructure

## 📖 Documentation

- [AI Workflow](docs/ai/AI_WORKFLOW.md) — Complete AI development log
- [Prompts](docs/ai/PROMPTS.md) — Prompt library used for AI generation
- [Session Exports](docs/ai/SESSION_EXPORTS.md) — Cursor session exports

## 🛠 Development Conventions

- **TypeScript strict mode** — Full type safety
- **ESLint + Prettier** — Consistent code style
- **Component specs** — `.spec.ts` files for unit tests
- **Composables** — Reusable logic with `.test.ts` coverage
- **No internal slice access** — Features cannot import other features' internals

## 🎯 Implemented Use Cases

| UC | Description | Status |
|----|-------------|--------|
| UC-001 | Browse catalog with infinite scroll | ✅ |
| UC-002 | Product detail with sortable offers | ✅ |
| UC-003 | Admin JWT authentication | ✅ |
| UC-004 | Admin catalog CRUD | ✅ |
| UC-005 | Seed script integration | ✅ |
| UC-006 | Agent search with NL parsing | ✅ |

---

**Built with ❤️ using AI + Human Engineering Supervision**
