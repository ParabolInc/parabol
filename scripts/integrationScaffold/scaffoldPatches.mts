import type {ScaffoldNames} from './makeScaffoldNames.mts'
import ScaffoldError from './ScaffoldError.mts'

export interface ScaffoldPatch {
  path: string
  apply(text: string, path: string): string
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
  order: 'sorted' | 'last',
  separator: ',' | '' = ','
) => {
  const lines = text.split('\n')
  let start = findLine(lines, path, opener)
  while (start < lines.length && !lines[start]?.trimEnd().endsWith('{')) start++
  start++
  let end = start
  while (ENTRY.test(lines[end] ?? '')) end++
  const entries = lines.slice(start, end).map((line) => line.replace(/,$/, ''))
  const parsed = entries.map((line) => ENTRY.exec(line) ?? [])
  const [, indent = '  '] = parsed[0] ?? []
  const flat =
    end > start &&
    lines[end]?.trimStart().startsWith('}') &&
    parsed.every(([, entryIndent]) => entryIndent === indent)
  if (!flat) {
    throw new ScaffoldError(`${path}: "${opener}" is not a flat list of one-line entries`)
  }
  const keys = parsed.map(([, , entryKey]) => entryKey)
  if (keys.includes(key)) throw new ScaffoldError(`${path}: already has ${key}`)
  const after = keys.findIndex((entryKey) => entryKey !== undefined && entryKey > key)
  const insertAt = order === 'last' || after === -1 ? entries.length : after
  entries.splice(insertAt, 0, `${indent}${key}: ${value}`)
  const rendered = entries.map((line, i) => (i < entries.length - 1 ? `${line}${separator}` : line))
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

const scaffoldPatches = ({
  service,
  pascal,
  title,
  envPrefix,
  hosts
}: ScaffoldNames): ScaffoldPatch[] => {
  const meta = `${service}IntegrationMeta`
  const metaImport = (fromIntegrations: string) =>
    `import {${meta}} from '${fromIntegrations}/${service}/shared/${meta}'`
  return [
    {
      path: 'packages/server/graphql/public/typeDefs/TaskServiceEnum.graphql',
      apply: (text, path) =>
        insertEnumValue(text, path, service, `  ${JSON.stringify(title)}\n  ${service}`)
    },
    {
      path: 'packages/server/graphql/public/typeDefs/IntegrationProviderServiceEnum.graphql',
      apply: (text, path) =>
        insertEnumValue(text, path, service, `\n  """\n  ${title}\n  """\n  ${service}`)
    },
    {
      path: 'codegen.json',
      apply: (text, path) => {
        const mapper =
          /^(\s+)"(\w+IntegrationService)": "\.\/types\/IntegrationService#IntegrationServiceSource",$/
        const typeName = `${pascal}IntegrationService`
        const lines = text.split('\n')
        const mappers = lines.flatMap((line, index) => {
          const [, indent, mapped] = mapper.exec(line) ?? []
          return indent && mapped ? [{index, indent, mapped}] : []
        })
        const lastMapper = mappers.at(-1)
        if (!lastMapper) throw new ScaffoldError(`${path}: no IntegrationService mappers`)
        if (mappers.some(({mapped}) => mapped === typeName)) {
          throw new ScaffoldError(`${path}: already maps ${typeName}`)
        }
        const insertAt =
          mappers.find(({mapped}) => mapped > typeName)?.index ?? lastMapper.index + 1
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
      apply: (text, path) => {
        const base = /(interface BaseTaskIntegration \{\n\s+service: )([^\n]+)/
        if (!base.test(text)) throw new ScaffoldError(`${path}: no BaseTaskIntegration service`)
        const withInterface = insertBefore(
          text.replace(base, `$1$2 | '${service}'`),
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
      apply: (text, path) => {
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
      path: 'packages/server/postgres/types/index.d.ts',
      apply: (text, path) =>
        insertEntry(
          text,
          path,
          'export type IntegrationSearchQueryJsonByService = {',
          service,
          '{queryString: string}',
          'last',
          ''
        )
    },
    {
      path: 'packages/server/integrations/platform/registry.ts',
      apply: (text, path) =>
        insertEntry(
          addImport(
            text,
            `import {${pascal}ServerIntegration} from '../${service}/${pascal}ServerIntegration'`
          ),
          path,
          'export const serverIntegrations = {',
          service,
          `new ${pascal}ServerIntegration()`,
          'sorted'
        )
    },
    {
      path: 'packages/server/integrations/platform/createOAuth2Manager.ts',
      apply: (text, path) =>
        insertEntry(
          addImport(
            text,
            `import ${pascal}OAuth2Manager from '../${service}/${pascal}OAuth2Manager'`
          ),
          path,
          'const OAUTH2_MANAGERS',
          service,
          `${pascal}OAuth2Manager`,
          'sorted'
        )
    },
    {
      path: 'packages/server/graphql/public/types/IntegrationService.ts',
      apply: (text, path) =>
        insertEntry(
          text,
          path,
          'const TYPENAME_BY_SERVICE = {',
          service,
          `'${pascal}IntegrationService'`,
          'sorted'
        )
    },
    {
      path: 'packages/server/graphql/public/types/RepoIntegration.ts',
      apply: (text, path) =>
        insertEntry(
          text,
          path,
          'const TYPENAME_BY_SERVICE = {',
          service,
          `'RepoContainer'`,
          'sorted'
        )
    },
    {
      path: 'packages/client/integrations/platform/registry.ts',
      apply: (text, path) =>
        insertEntry(
          addImport(
            text,
            `import {${pascal}ClientIntegration} from '../${service}/${pascal}ClientIntegration'`
          ),
          path,
          'const taskIntegrations = {',
          service,
          `new ${pascal}ClientIntegration()`,
          'last'
        )
    },
    {
      path: 'packages/client/modules/email/components/SummaryEmail/MeetingSummaryEmail/ExportAllTasks.tsx',
      apply: (text, path) =>
        insertEntry(
          addImport(text, metaImport('../../../../../integrations')),
          path,
          'const integrationToServiceName',
          service,
          `${meta}.title`,
          'last'
        )
    },
    {
      path: 'packages/client/shared/reports/reportCatalog.ts',
      apply: (text, path) =>
        insertEntry(
          addImport(text, metaImport('../../integrations')),
          path,
          'export const REPORT_INTEGRATION_LABELS',
          service,
          `${meta}.title`,
          'last'
        )
    },
    {
      path: 'scripts/toolboxSrc/primeIntegrations.ts',
      apply: (text, path) => {
        const serverBaseUrl = hosts
          ? JSON.stringify(hosts.apiUrl)
          : `process.env.${envPrefix}_SERVER_URL`
        const lines = text.split('\n')
        const close = findLine(
          lines,
          path,
          '] as const',
          findLine(lines, path, 'const providers = [')
        )
        if (lines[close - 1]?.trim() !== '}') {
          throw new ScaffoldError(`${path}: the providers list does not end with an object`)
        }
        lines[close - 1] = `${lines[close - 1]},`
        lines.splice(
          close,
          0,
          [
            '    {',
            `      service: '${service}',`,
            `      authStrategy: 'oauth2',`,
            `      scope: 'global',`,
            `      serverBaseUrl: ${serverBaseUrl},`,
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
      apply: (text, path) => {
        const lines = text.split('\n')
        const last = lines.findLastIndex((line) => /^# [A-Z0-9_]+_CLIENT_SECRET=/.test(line))
        if (last === -1) throw new ScaffoldError(`${path}: no *_CLIENT_SECRET line`)
        lines.splice(
          last + 1,
          0,
          `# ${envPrefix}_CLIENT_ID=''`,
          `# ${envPrefix}_CLIENT_SECRET=''`,
          ...(hosts ? [] : [`# ${envPrefix}_SERVER_URL=''`])
        )
        return lines.join('\n')
      }
    }
  ]
}

export default scaffoldPatches
