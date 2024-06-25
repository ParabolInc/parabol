const tsJestPresets = require('ts-jest/presets')

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false
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
  clearMocks: true
}
