module.exports = {
  testEnvironment: 'node',
  transform: {
    '\\.(gql|graphql)$': '../server/__tests__/jest-transform-graphql-shim.js',
    '^.+\\.(t|j)sx?$': ['@swc/jest', {jsc: {transform: {react: {runtime: 'automatic'}}}}]
  },
  transformIgnorePatterns: ['/marked\.esm\.js/'],
  modulePaths: ['<rootDir>/packages/'],
  moduleNameMapper: {
    '~/(.*)': ['<rootDir>/../client/$1'],
    '\\.svg$': '<rootDir>/__mocks__/fileMock.js'
  },
  testRegex: '/__tests__/.*.test\\.[jt]sx?$'
}
