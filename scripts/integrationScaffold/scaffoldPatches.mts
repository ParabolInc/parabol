import type {ScaffoldNames} from './scaffoldNames.mts'

export class ScaffoldError extends Error {}

export interface ScaffoldPatch {
  path: string
  apply(text: string): string
}

const ENTRY = /^(\s+)([A-Za-z0-9_]+): .+$/

const findLine = (lines: string[], path: string, anchor: string, from = 0) => {
  const index = lines.findIndex((line, i) => i >= from && line.includes(anchor))
  if (index === -1) throw new ScaffoldError(`${path}: could not find "${anchor}"`)
  return index
}

const addImport = (text: string, importLine: string) => `${importLine}\n${text}`

const insertEntry = (
  text: string,
  path: string,
  opener: string,
  key: string,
  value: string,
  order: 'sorted' | 'last'
) => {
  const lines = text.split('\n')
  let start = findLine(lines, path, opener)
  while (start < lines.length && !lines[start]?.trimEnd().endsWith('{')) start++
  start++
  let end = start
  while (ENTRY.test(lines[end] ?? '')) end++
  const entries = lines.slice(start, end).map((line) => line.replace(/,$/, ''))
  const parsed = entries.map((line) => ENTRY.exec(line) ?? [])
  const [, indent] = parsed[0] ?? []
  if (!indent) throw new ScaffoldError(`${path}: "${opener}" has no entries to extend`)
  const keys = parsed.map(([, , entryKey]) => entryKey)
  if (keys.includes(key)) throw new ScaffoldError(`${path}: already has ${key}`)
  const after = keys.findIndex((entryKey) => entryKey !== undefined && entryKey > key)
  const insertAt = order === 'last' || after === -1 ? entries.length : after
  entries.splice(insertAt, 0, `${indent}${key}: ${value}`)
  const rendered = entries.map((line, i) => (i < entries.length - 1 ? `${line},` : line))
  lines.splice(start, end - start, ...rendered)
  return lines.join('\n')
}

const insertBefore = (text: string, path: string, anchor: string, insertion: string) => {
  const lines = text.split('\n')
  lines.splice(findLine(lines, path, anchor), 0, insertion)
  return lines.join('\n')
}

const appendUnionMember = (text: string, path: string, declaration: string, member: string) => {
  const lines = text.split('\n')
  let last = findLine(lines, path, declaration)
  while (lines[last + 1]?.trimStart().startsWith('| ')) last++
  lines.splice(last + 1, 0, `  | ${member}`)
  return lines.join('\n')
}

const insertEnumValue = (text: string, path: string, name: string, value: string) => {
  if (new RegExp(`^\\s+${name}$`, 'm').test(text)) {
    throw new ScaffoldError(`${path}: already has ${name}`)
  }
  const close = text.lastIndexOf('\n}')
  if (close === -1) throw new ScaffoldError(`${path}: no closing brace`)
  return `${text.slice(0, close)}\n${value}${text.slice(close)}`
}

const scaffoldPatches = ({service, pascal, title, envPrefix}: ScaffoldNames): ScaffoldPatch[] => [
  {
    path: 'packages/server/graphql/public/typeDefs/TaskServiceEnum.graphql',
    apply: (text) =>
      insertEnumValue(
        text,
        'TaskServiceEnum.graphql',
        service,
        `  ${JSON.stringify(title)}\n  ${service}`
      )
  },
  {
    path: 'packages/server/graphql/public/typeDefs/IntegrationProviderServiceEnum.graphql',
    apply: (text) =>
      insertEnumValue(
        text,
        'IntegrationProviderServiceEnum.graphql',
        service,
        `\n  """\n  ${title}\n  """\n  ${service}`
      )
  },
  {
    path: 'codegen.json',
    apply: (text) => {
      const mapper =
        /^(\s+)"(\w+IntegrationService)": "\.\/types\/IntegrationService#IntegrationServiceSource",$/
      const typeName = `${pascal}IntegrationService`
      const lines = text.split('\n')
      const mappers = lines.flatMap((line, index) => {
        const [, indent, mapped] = mapper.exec(line) ?? []
        return indent && mapped ? [{index, indent, mapped}] : []
      })
      const lastMapper = mappers.at(-1)
      if (!lastMapper) throw new ScaffoldError('codegen.json: no IntegrationService mappers')
      if (mappers.some(({mapped}) => mapped === typeName)) {
        throw new ScaffoldError(`codegen.json: already maps ${typeName}`)
      }
      const insertAt = mappers.find(({mapped}) => mapped > typeName)?.index ?? lastMapper.index + 1
      lines.splice(
        insertAt,
        0,
        `${lastMapper.indent}"${typeName}": "./types/IntegrationService#IntegrationServiceSource",`
      )
      return lines.join('\n')
    }
  },
  {
    path: 'packages/client/shared/types/TaskIntegration.d.ts',
    apply: (text) => {
      const path = 'TaskIntegration.d.ts'
      const base = /(interface BaseTaskIntegration \{\n\s+service: )([^\n]+)/
      if (!base.test(text)) throw new ScaffoldError(`${path}: no BaseTaskIntegration service`)
      const withBase = text.replace(base, `$1$2 | '${service}'`)
      const withInterface = insertBefore(
        withBase,
        path,
        'export type AnyTaskIntegration =',
        `interface TaskIntegration${pascal} extends BaseTaskIntegration {\n  service: '${service}'\n  repoId: string\n  issueId: string\n}\n`
      )
      return appendUnionMember(
        withInterface,
        path,
        'export type AnyTaskIntegration =',
        `TaskIntegration${pascal}`
      )
    }
  },
  {
    path: 'packages/server/postgres/types/IntegrationProvider.d.ts',
    apply: (text) => {
      const path = 'IntegrationProvider.d.ts'
      const withInterface = insertBefore(
        text,
        path,
        'export type TIntegrationProvider =',
        `export interface IntegrationProvider${pascal}OAuth2 extends IntegrationProviderOAuth2 {\n  service: '${service}'\n}\n`
      )
      return appendUnionMember(
        withInterface,
        path,
        'export type TIntegrationProvider =',
        `IntegrationProvider${pascal}OAuth2`
      )
    }
  },
  {
    path: 'packages/server/integrations/platform/registry.ts',
    apply: (text) =>
      insertEntry(
        addImport(
          text,
          `import {${pascal}ServerIntegration} from '../${service}/${pascal}ServerIntegration'`
        ),
        'server registry.ts',
        'export const serverIntegrations = {',
        service,
        `new ${pascal}ServerIntegration()`,
        'sorted'
      )
  },
  {
    path: 'packages/server/integrations/platform/createOAuth2Manager.ts',
    apply: (text) =>
      insertEntry(
        addImport(
          text,
          `import ${pascal}OAuth2Manager from '../${service}/${pascal}OAuth2Manager'`
        ),
        'createOAuth2Manager.ts',
        'const OAUTH2_MANAGERS',
        service,
        `${pascal}OAuth2Manager`,
        'sorted'
      )
  },
  {
    path: 'packages/server/graphql/public/types/IntegrationService.ts',
    apply: (text) =>
      insertEntry(
        text,
        'IntegrationService.ts',
        'const TYPENAME_BY_SERVICE = {',
        service,
        `'${pascal}IntegrationService'`,
        'sorted'
      )
  },
  {
    path: 'packages/server/graphql/public/types/RepoIntegration.ts',
    apply: (text) =>
      insertEntry(
        text,
        'RepoIntegration.ts',
        'const TYPENAME_BY_SERVICE = {',
        service,
        `'RepoContainer'`,
        'sorted'
      )
  },
  {
    path: 'packages/client/integrations/platform/registry.ts',
    apply: (text) =>
      insertEntry(
        addImport(
          text,
          `import {${pascal}ClientIntegration} from '../${service}/${pascal}ClientIntegration'`
        ),
        'client registry.ts',
        'const taskIntegrations = {',
        service,
        `new ${pascal}ClientIntegration()`,
        'last'
      )
  },
  {
    path: 'packages/client/modules/email/components/SummaryEmail/MeetingSummaryEmail/ExportAllTasks.tsx',
    apply: (text) =>
      insertEntry(
        text,
        'ExportAllTasks.tsx',
        'const integrationToServiceName',
        service,
        JSON.stringify(title),
        'last'
      )
  },
  {
    path: 'scripts/toolboxSrc/primeIntegrations.ts',
    apply: (text) => {
      const path = 'primeIntegrations.ts'
      const lines = text.split('\n')
      const close = findLine(
        lines,
        path,
        '] as const',
        findLine(lines, path, 'const providers = [')
      )
      lines[close - 1] = `${lines[close - 1]},`
      lines.splice(
        close,
        0,
        [
          '    {',
          `      service: '${service}',`,
          `      authStrategy: 'oauth2',`,
          `      scope: 'global',`,
          `      serverBaseUrl: process.env.${envPrefix}_SERVER_URL,`,
          `      clientId: process.env.${envPrefix}_CLIENT_ID,`,
          `      clientSecret: process.env.${envPrefix}_CLIENT_SECRET`,
          '    }'
        ].join('\n')
      )
      return lines.join('\n')
    }
  },
  {
    path: '.env.example',
    apply: (text) => {
      const lines = text.split('\n')
      const last = lines.findLastIndex((line) => /^# [A-Z0-9_]+_CLIENT_SECRET=/.test(line))
      if (last === -1) throw new ScaffoldError('.env.example: no *_CLIENT_SECRET line')
      lines.splice(
        last + 1,
        0,
        `# ${envPrefix}_CLIENT_ID=''`,
        `# ${envPrefix}_CLIENT_SECRET=''`,
        `# ${envPrefix}_SERVER_URL=''`
      )
      return lines.join('\n')
    }
  }
]

export default scaffoldPatches
