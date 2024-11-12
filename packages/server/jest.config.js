const tsJestPresets = require('ts-jest/presets')

module.exports = {
  testEnvironment: 'node',
  transform: {
    '\\.(gql|graphql)$': './__tests__/jest-transform-graphql-shim.js',
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic'
            },
            // abstract classes will lose their default values when compiled with SWC
            useDefineForClassFields: false
          }
        }
      }
    ]
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
  globalTeardown: './__tests__/globalTeardown.ts',
  clearMocks: true
}
