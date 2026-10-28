const base = require('./jest.config')

module.exports = {
  ...base,
  testRegex: '/__evals__/.*\\.eval\\.ts$',
  globalSetup: undefined,
  globalTeardown: undefined,
  setupFiles: ['<rootDir>/__evals__/loadEnv.ts', ...base.setupFiles],
  testTimeout: 1_800_000
}
