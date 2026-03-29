/*
MODULE_CONTRACT: Define the frontend ambient type surface for Vite and Vue.
SCOPE: ImportMeta env defaults and Vue single-file component declarations.
DEPENDS: package.json, tsconfig.json
LINKS: [FrontendTooling][setup][BLOCK_DEFINE_TOOLCHAIN]

MODULE_MAP:
- ambient-types - Ambient Vite and Vue module declarations.
CONTRACT:
PURPOSE: Define the stable type or ambient declaration surface described by MODULE_CONTRACT.
INPUTS: none.
OUTPUTS: TypeScript types, interfaces, or ambient module declarations only.
SIDE_EFFECTS: none.
START_BLOCK_TYPES
Ambient declarations for Vite env variables and Vue SFC imports.
END_BLOCK_TYPES
CHANGE_SUMMARY: Added GRACE semantic metadata completion for full-integrity review.
*/
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AGENT_SEARCH_URL: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}
