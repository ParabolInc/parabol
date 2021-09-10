const {jsWithTs: tsjPreset} = require('ts-jest/presets')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  transform: {
    ...tsjPreset.transform,
  },
}
