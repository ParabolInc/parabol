const tsJestPresets = require('ts-jest/presets')

module.exports = {
  testEnvironment: 'node',
  transform: {
    '\\.(gql|graphql)$': '../server/__tests__/jest-transform-graphql-shim.js',
    '^.+\\.(t|j)sx?$': ['@swc/jest']
  },
  modulePaths: ['<rootDir>/packages/'],
  moduleNameMapper: {
    '~/(.*)': ['<rootDir>/../client/$1']
  },
  testRegex: '/__tests__/.*.test\\.[jt]sx?$'
}
