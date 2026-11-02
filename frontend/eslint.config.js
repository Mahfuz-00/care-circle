import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

// eslint-plugin-react-hooks exposes flat presets under `configs.flat.*` in v6+.
// Older versions shipped eslintrc-style presets, so build one by hand for those.
const reactHooksPreset =
  reactHooks.configs.flat?.['recommended-latest'] ??
  reactHooks.configs.flat?.recommended ??
  reactHooks.configs['recommended-latest'] ??
  reactHooks.configs.recommended

const reactHooksRecommended =
  reactHooksPreset && !Array.isArray(reactHooksPreset.plugins)
    ? reactHooksPreset
    : { plugins: { 'react-hooks': reactHooks }, rules: reactHooksPreset?.rules ?? {} }

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', '*.config.js'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooksRecommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
  },
  {
    // Non-component modules (router, api client, stores, constants) legitimately
    // export non-component values, so fast-refresh's single-export rule does not apply.
    files: [
      'src/routes/**/*.{ts,tsx}',
      'src/lib/**/*.ts',
      'src/stores/**/*.ts',
      'src/features/**/options.ts',
      'src/features/**/*Route.tsx',
    ],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['vite.config.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
)
