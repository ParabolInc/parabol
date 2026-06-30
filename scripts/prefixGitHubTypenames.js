/*
  Post-processes the codegen output for GitHub operations (githubTypes.ts).

  The GitHub GraphQL API is nested into our schema via nest-graphql-endpoint, which prefixes every
  GitHub type with `_xGitHub` (see packages/server/utils/nestGitHub.ts). At runtime, every
  `__typename` we get back from a GitHub query is therefore prefixed, e.g. an Issue arrives as
  `_xGitHubIssue`.

  codegen, however, generates these types from the raw octokit schema (githubSchema.graphql) where
  types are unprefixed — which is also what the query documents must use, since nest forwards them
  to GitHub essentially as-authored. The result is a mismatch: the generated discriminated unions
  use `__typename: 'Issue'` while runtime values are `__typename: '_xGitHubIssue'`.

  This script bridges that gap by prefixing every `__typename` string literal in the generated file
  so the types match what callers actually receive. It is wired up as the `afterOneFileWrite` hook
  for the GitHub block in codegen.json, and is idempotent.
*/
const fs = require('fs')

const PREFIX = '_xGitHub'

// graphql-codegen passes the written file path as the final CLI argument.
const filePath = process.argv[process.argv.length - 1]

if (filePath && filePath.endsWith('githubTypes.ts')) {
  const contents = fs.readFileSync(filePath, 'utf8')
  // Match `__typename: 'Foo'` / `__typename?: 'Foo'` and prefix the literal. The negative
  // lookahead keeps it idempotent so re-running never doubles the prefix.
  const prefixed = contents.replace(
    /(__typename\??:\s*')(?!_xGitHub)([A-Za-z0-9_]+)(')/g,
    `$1${PREFIX}$2$3`
  )
  if (prefixed !== contents) {
    fs.writeFileSync(filePath, prefixed)
  }
}
