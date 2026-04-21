import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue']
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    files: ['server/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**']
  }
]
