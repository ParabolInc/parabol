module.exports = {
  // prettier comes last to turn off all the eslint rules that conflict with it
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: 'tsconfig.eslint.json',
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  ignorePatterns: ['*.js']
}
