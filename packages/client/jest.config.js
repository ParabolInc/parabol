module.exports = {
  testEnvironment: 'node',
  transform: {
    '\\.(gql|graphql)$': '../server/__tests__/jest-transform-graphql-shim.js',
    '\\.svg$': '<rootDir>/jest-transform-svg.js',
    '^.+\\.(t|j)sx?$': ['@swc/jest', {jsc: {transform: {react: {runtime: 'automatic'}}}}]
  },
  transformIgnorePatterns: ['/marked\.esm\.js/'],
  modulePaths: ['<rootDir>/packages/'],
  moduleNameMapper: {
    '~/(.*)': ['<rootDir>/../client/$1']
  },
  testRegex: '/__tests__/.*.test\\.[jt]sx?$'
}
