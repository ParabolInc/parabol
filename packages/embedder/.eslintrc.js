module.exports = {
  extends: [
    '../../.eslintrc.js'
  ],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  "ignorePatterns": ["**/lib", "*.js"]
}
