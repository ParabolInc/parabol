import {FlatCompat} from '@eslint/eslintrc'
import js from '@eslint/js'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import base from '../../eslint.config.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  ...base,
  {
    ignores: [
      '**/__generated__/',
      '**/generated/',
      'githubTypes.ts',
      'gitlabTypes.ts',
      'resolverTypes.ts',
      'githubSchema.graphql',
      'gitlabSchema.graphql',
      'graphql/private/schema.graphql',
      'graphql/public/schema.graphql',
      '_legacy.graphql',
      'migrationTemplate.ts',
      'billing/debug.ts',
      'pg.d.ts'
    ]
  }
]
