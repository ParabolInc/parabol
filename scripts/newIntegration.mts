/*
  Scaffolds a task integration: pnpm integration:new <service> --title <Title> [--description <text>] [--dry-run]
  Writes a typed stub for every capability the conformance suites require and adds the service to every list that names one.
  Nothing is written unless every file it patches still has the shape it expects.
  docs/integrations/CONTRIBUTING.md walks through what to build next
*/
import {execFileSync} from 'child_process'
import fs from 'fs'
import path from 'path'
import {parseArgs} from 'util'
import clientFiles from './integrationScaffold/clientFiles.mts'
import makeScaffoldNames, {SERVICE_PATTERN} from './integrationScaffold/scaffoldNames.mts'
import scaffoldPatches, {ScaffoldError} from './integrationScaffold/scaffoldPatches.mts'
import schemaFiles, {INTEGRATION_SERVICE_INTERFACE} from './integrationScaffold/schemaFiles.mts'
import serverFiles from './integrationScaffold/serverFiles.mts'
import getProjectRoot from './webpack/utils/getProjectRoot.js'

const PROJECT_ROOT = getProjectRoot()
const USAGE =
  'Usage: pnpm integration:new <service> --title <Title> [--description <text>] [--dry-run]'

const readRepoFile = (repoPath: string) =>
  fs.readFileSync(path.join(PROJECT_ROOT, repoPath), 'utf8')

const fail = (message: string): never => {
  console.error(message)
  process.exit(1)
}

const parseCommand = () => {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        title: {type: 'string'},
        description: {type: 'string'},
        'dry-run': {type: 'boolean', default: false}
      }
    })
  } catch (error) {
    return fail(`${error instanceof Error ? error.message : String(error)}\n${USAGE}`)
  }
}

const newIntegration = () => {
  const {positionals, values} = parseCommand()
  const [service, ...extra] = positionals
  const title = values.title?.trim()
  if (!service || extra.length) return fail(USAGE)
  if (!SERVICE_PATTERN.test(service)) {
    return fail(`"${service}" must be camelCase letters and digits, e.g. clickUp`)
  }
  if (!title) return fail(`--title is required\n${USAGE}`)

  const names = makeScaffoldNames(service, title, values.description?.trim())
  const files = [
    ...serverFiles(names),
    ...clientFiles(names),
    ...schemaFiles(names, readRepoFile(INTEGRATION_SERVICE_INTERFACE), new Date())
  ]
  const existing = files.filter((file) => fs.existsSync(path.join(PROJECT_ROOT, file.path)))
  if (existing.length) {
    return fail(
      `Nothing was written. These files already exist:\n${existing.map((file) => `  ${file.path}`).join('\n')}`
    )
  }

  let patched: {path: string; contents: string}[]
  try {
    patched = scaffoldPatches(names).map(({path: repoPath, apply}) => ({
      path: repoPath,
      contents: apply(readRepoFile(repoPath))
    }))
  } catch (error) {
    if (error instanceof ScaffoldError) return fail(`Nothing was written. ${error.message}`)
    throw error
  }

  if (values['dry-run']) {
    console.log(`Would create:\n${files.map((file) => `  ${file.path}`).join('\n')}`)
    console.log(`Would update:\n${patched.map((file) => `  ${file.path}`).join('\n')}`)
    return
  }

  for (const file of [...files, ...patched]) {
    const absolutePath = path.join(PROJECT_ROOT, file.path)
    fs.mkdirSync(path.dirname(absolutePath), {recursive: true})
    fs.writeFileSync(absolutePath, file.contents)
  }
  const formattable = [...files, ...patched]
    .map((file) => file.path)
    .filter((repoPath) => /\.(tsx?|json)$/.test(repoPath))
  try {
    execFileSync(
      path.join(PROJECT_ROOT, 'node_modules', '.bin', 'biome'),
      ['check', '--write', ...formattable],
      {cwd: PROJECT_ROOT, stdio: 'inherit'}
    )
  } catch {
    console.warn('biome could not tidy every file; run `pnpm exec biome check --write` on them')
  }

  const {envPrefix} = names
  console.log(`
Scaffolded ${service}: ${files.length} files created, ${patched.length} updated. Next:
  1. pnpm kysely migrate:latest && pnpm pg:generate
  2. pnpm relay:build && pnpm typecheck
  3. pnpm test:server integrations/platform/__tests__/conformance.test.ts
     pnpm test:client integrations/platform/__tests__/conformance.test.ts
     The client suite fails until ${service} ships a scoping panel and a work drawer tab
  4. Replace each "not implemented" stub with calls to ${title}
  5. Set ${envPrefix}_CLIENT_ID, ${envPrefix}_CLIENT_SECRET and ${envPrefix}_SERVER_URL in .env
See docs/integrations/CONTRIBUTING.md`)
}

newIntegration()
