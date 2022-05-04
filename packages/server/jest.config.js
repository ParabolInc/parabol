const tsJestPresets = require('ts-jest/presets')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  transform: {
    '\\.(gql|graphql)$': 'jest-transform-graphql',
    ...tsJestPresets.jsWithBabel.transform
  },
  modulePaths: ['<rootDir>/packages/'],
  moduleNameMapper: {
    'server/(.*)': ['<rootDir>/$1'],
    'parabol-client/(.*)': ['<rootDir>/../client/$1'],
    '~/(.*)': ['<rootDir>/../client/$1']
  },
  testRegex: '/__tests__/.*.test\\.ts?$',
  setupFilesAfterEnv: ['./__tests__/setup.ts'],
  globalSetup: './__tests__/globalSetup.ts',
  globalTeardown: './__tests__/globalTeardown.ts'
}
