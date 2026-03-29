/*
MODULE_CONTRACT: Define the frontend lint contract for TypeScript and Vue sources.
SCOPE: Source file targeting, import resolution, Vue parsing, and future FSD guardrails.
DEPENDS: package.json, tsconfig.json
LINKS: [FrontendTooling][setup][BLOCK_DEFINE_TOOLCHAIN]
START_BLOCK_IMPORTS
ESLint parser, plugin, and resolver imports.
END_BLOCK_IMPORTS
START_BLOCK_RULES
Shared lint rules and source-specific blocks.
END_BLOCK_RULES
*/
import { fileURLToPath } from 'node:url';

import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

const tsProject = './tsconfig.json';
const tsconfigRootDir = fileURLToPath(new URL('.', import.meta.url));
const importResolver = {
  typescript: {
    project: tsProject,
  },
};
const layers = [
  'shared',
  'entities',
  'features',
  'widgets',
  'pages',
];
const publicApiPatterns = layers.map((layer) => ({
  group: [
    `@/${layer}/*/**`,
  ],
  message: `Import from ${layer} only through its public API index.`,
}));

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
    ],
  },
  {
    files: [
      'src/**/*.{ts,vue}',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      parser: vueParser,
      parserOptions: {
        extraFileExtensions: [
          '.vue',
        ],
        parser: tsParser,
        project: tsProject,
        sourceType: 'module',
        tsconfigRootDir,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      vue: vuePlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'import/no-unresolved': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: publicApiPatterns,
        },
      ],
      'vue/multi-word-component-names': 'off',
    },
    settings: {
      'import/resolver': importResolver,
    },
  },
  {
    files: [
      'src/shared/**/*.{ts,vue}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@/entities/**',
            '@/features/**',
            '@/widgets/**',
            '@/pages/**',
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/entities/**/*.{ts,vue}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@/features/**',
            '@/widgets/**',
            '@/pages/**',
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/features/**/*.{ts,vue}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@/widgets/**',
            '@/pages/**',
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/widgets/**/*.{ts,vue}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@/pages/**',
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/pages/**/*.{ts,vue}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@/app/**',
          ],
        },
      ],
    },
  },
];
