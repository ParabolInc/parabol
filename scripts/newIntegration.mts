/*
  Scaffolds a task integration: pnpm integration:new <service> --title <Title> (--api-url <url> --authorize-url <url> --token-url <url> | --self-hosted) [--description <text>] [--dry-run]
  Writes a typed stub for every capability the conformance suites require and adds the service to every list that names one.
  Nothing is written unless every file it patches still has the shape it expects.
  docs/integrations/CONTRIBUTING.md walks through what to build next
*/
import {execFileSync} from 'child_process'
import fs from 'fs'
import path from 'path'
import {parseArgs} from 'util'
import clientFiles from './integrationScaffold/clientFiles.mts'
import makeScaffoldNames, {
  type ScaffoldHosts,
  type ScaffoldNames,
  SERVICE_PATTERN
} from './integrationScaffold/makeScaffoldNames.mts'
import ScaffoldError from './integrationScaffold/ScaffoldError.mts'
import type {ScaffoldFile} from './integrationScaffold/ScaffoldFile.mts'
import scaffoldPatches from './integrationScaffold/scaffoldPatches.mts'
import schemaFiles, {INTEGRATION_SERVICE_INTERFACE} from './integrationScaffold/schemaFiles.mts'
import serverFiles from './integrationScaffold/serverFiles.mts'
import getProjectRoot from './webpack/utils/getProjectRoot.js'

const PROJECT_ROOT = getProjectRoot()
const USAGE = [
  'Usage: pnpm integration:new <service> --title <Title>',
  '  (--api-url <url> --authorize-url <url> --token-url <url> | --self-hosted)',
  '  [--description <text>] [--dry-run]'
].join('\n')

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
        'api-url': {type: 'string'},
        'authorize-url': {type: 'string'},
        'token-url': {type: 'string'},
        'self-hosted': {type: 'boolean', default: false},
        'dry-run': {type: 'boolean', default: false}
      }
    })
  } catch (error) {
    return fail(`${error instanceof Error ? error.message : String(error)}\n${USAGE}`)
  }
}

const parseHosts = (values: ReturnType<typeof parseCommand>['values']): ScaffoldHosts | null => {
  const apiUrl = values['api-url']?.trim()
  const authorizeUrl = values['authorize-url']?.trim()
  const tokenUrl = values['token-url']?.trim()
  if (values['self-hosted']) {
    if (apiUrl || authorizeUrl || tokenUrl) return fail(`--self-hosted takes no URLs\n${USAGE}`)
    return null
  }
  if (!apiUrl || !authorizeUrl || !tokenUrl) {
    return fail(`Pass --api-url, --authorize-url and --token-url, or --self-hosted\n${USAGE}`)
  }
  return {apiUrl, authorizeUrl, tokenUrl}
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
  const hosts = parseHosts(values)

  let names: ScaffoldNames
  let files: ScaffoldFile[]
  let patched: ScaffoldFile[]
  try {
    names = makeScaffoldNames(service, title, values.description?.trim(), hosts)
    files = [
      ...serverFiles(names),
      ...clientFiles(names),
      ...schemaFiles(names, readRepoFile(INTEGRATION_SERVICE_INTERFACE), new Date())
    ]
    patched = scaffoldPatches(names).map(({path: repoPath, apply}) => ({
      path: repoPath,
      contents: apply(readRepoFile(repoPath), repoPath)
    }))
  } catch (error) {
    if (error instanceof ScaffoldError) return fail(`Nothing was written. ${error.message}`)
    throw error
  }
  const existing = files.filter((file) => fs.existsSync(path.join(PROJECT_ROOT, file.path)))
  if (existing.length) {
    const list = existing.map((file) => `  ${file.path}`).join('\n')
    return fail(`Nothing was written. These files already exist:\n${list}`)
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
    console.warn(
      `biome could not tidy every file. Run: pnpm exec biome check --write ${formattable.join(' ')}`
    )
  }

  const {envPrefix} = names
  const envVars = hosts
    ? `${envPrefix}_CLIENT_ID and ${envPrefix}_CLIENT_SECRET`
    : `${envPrefix}_CLIENT_ID, ${envPrefix}_CLIENT_SECRET and ${envPrefix}_SERVER_URL`
  console.log(`
Scaffolded ${service}: ${files.length} files created, ${patched.length} updated. Next:
  1. pnpm kysely migrate:latest && pnpm pg:generate
  2. pnpm relay:build && pnpm typecheck
  3. pnpm test:server integrations/platform/__tests__/conformance.test.ts
     pnpm test:client integrations/platform/__tests__/conformance.test.ts
     The client suite fails until ${service} ships a scoping tab and a work drawer tab
  4. Replace the stubs ${hosts ? '' : 'and the placeholder OAuth paths '}with calls to ${title}
  5. Set ${envVars} in .env
See "After the scaffold" in docs/integrations/CONTRIBUTING.md`)
}

newIntegration()
