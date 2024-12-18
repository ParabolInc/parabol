import {fixupPluginRules} from '@eslint/compat'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import emotion from 'eslint-plugin-emotion'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import base from '../../eslint.config.mjs'

export default [
  ...base,
  {
    ignores: ['__generated__/*'],
  },
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      emotion,
      react,
      'react-hooks': fixupPluginRules(reactHooks)
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'emotion/jsx-import': 'error',
      'emotion/no-vanilla': 'error',
      'emotion/import-from-emotion': 'error',
      'emotion/styled-import': 'error',
      'react/no-find-dom-node': 'off',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'warn',
      'space-before-function-paren': 'off'
    }
  }
]
