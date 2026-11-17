jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import fs from 'fs'
import {type EnumTypeDefinitionNode, Kind, parse} from 'graphql'
import type {IntegrationMeta} from 'parabol-client/shared/integrations/IntegrationMeta'
import type {TaskServiceEnum as StoredTaskService} from 'parabol-client/shared/types/TaskIntegration'
import path from 'path'
import type {
  IntegrationProviderServiceEnum,
  TaskServiceEnum
} from '../../../graphql/public/resolverTypes'
import type {TIntegrationProvider} from '../../../postgres/types/IntegrationProvider'
import createOAuth2Manager from '../createOAuth2Manager'
import {type ServerIntegrations, serverIntegrations} from '../registry'
import {
  type IntegrationCapabilityKey,
  type RepoAccessCapability,
  type RepoListCapability,
  ServerIntegrationDefinition
} from '../ServerIntegrationDefinition'

type MutuallyAssignable<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never
type GrantsWhatItLists<Definition> = Definition extends {
  capabilities: {
    repoAccess: RepoAccessCapability<infer Granted>
    repoList: RepoListCapability<infer Listed>
  }
}
  ? [Granted] extends [Listed]
    ? [Listed] extends [Granted]
      ? true
      : false
    : false
  : true

const enumValues = (enumName: string) => {
  const file = path.join(__dirname, `../../../graphql/public/typeDefs/${enumName}.graphql`)
  const definition = parse(fs.readFileSync(file, 'utf8')).definitions.find(
    (node): node is EnumTypeDefinitionNode =>
      node.kind === Kind.ENUM_TYPE_DEFINITION && node.name.value === enumName
  )
  if (!definition?.values) throw new Error(`No ${enumName} in the SDL`)
  return definition.values.map(({name}) => name.value)
}

const TASK_SERVICES = enumValues('TaskServiceEnum').filter((service) => service !== 'PARABOL')
const TASK_CAPABILITIES: IntegrationCapabilityKey[] = [
  'issueCreate',
  'issueRead',
  'issueSearch',
  'repoList',
  'estimatePush'
]
const MALFORMED_HASHES = ['', 'x', ':::', '{}']

const entries = Object.entries<ServerIntegrationDefinition>(serverIntegrations)
const taskEntries = entries.filter(([key]) => TASK_SERVICES.includes(key))
const oauth2Entries = entries.filter(([, definition]) => definition.authStrategy === 'oauth2')
const readEntries = entries.filter(([, definition]) => definition.capabilities.issueRead)
const searchEntries = entries.filter(([, definition]) => definition.capabilities.issueSearch)
const pushEntries = entries.filter(([, definition]) => definition.capabilities.estimatePush)
const listEntries = entries.filter(([, definition]) => definition.capabilities.issueList)

it('the SDL TaskServiceEnum and the services a Task row stores stay in sync', () => {
  const inSync: MutuallyAssignable<TaskServiceEnum, StoredTaskService> = true
  expect(inSync).toBe(true)
})

it('a repoAccess service grants access to the same repos it lists', () => {
  const sameRepos: false extends GrantsWhatItLists<ServerIntegrations[keyof ServerIntegrations]>
    ? never
    : true = true
  expect(sameRepos).toBe(true)
})

it('every IntegrationMeta service is an IntegrationProviderServiceEnum value', () => {
  const isProviderService: [IntegrationMeta['service']] extends [IntegrationProviderServiceEnum]
    ? true
    : never = true
  expect(isProviderService).toBe(true)
})

describe.each(entries)('%s conformance', (key, definition) => {
  it('matches its registry key and its shared IntegrationMeta', async () => {
    const metaModule = await import(
      `parabol-client/integrations/${key}/shared/${key}IntegrationMeta`
    )
    const meta: IntegrationMeta = metaModule[`${key}IntegrationMeta`]
    expect(definition.service).toBe(key)
    expect({service: definition.service, title: definition.title}).toEqual({
      service: meta.service,
      title: meta.title
    })
  })

  it('exposes resolveAuth as a function of arity 1', () => {
    expect(definition.resolveAuth.length).toBe(1)
  })

  it('declares only IntegrationCapabilityEnum capabilities', () => {
    const known = enumValues('IntegrationCapabilityEnum')
    definition.getCapabilityKeys().forEach((capability) => expect(known).toContain(capability))
  })
})

it.each(taskEntries)('%s: a task service implements every task capability', (_key, definition) => {
  expect(definition.getCapabilityKeys()).toEqual(expect.arrayContaining(TASK_CAPABILITIES))
})

it.each(oauth2Entries)(
  '%s: an OAuth2 service has a token manager or resolves its own auth',
  (_key, definition) => {
    const resolvesItsOwnAuth =
      definition.resolveAuth !== ServerIntegrationDefinition.prototype.resolveAuth
    const provider = {
      authStrategy: 'oauth2',
      service: definition.service,
      clientId: 'client',
      clientSecret: 'secret',
      serverBaseUrl: 'https://example.com',
      isActive: true
    } as TIntegrationProvider
    expect(resolvesItsOwnAuth || createOAuth2Manager(provider) !== null).toBe(true)
  }
)

it.each(readEntries)('%s: parseIntegrationHash rejects a malformed hash', (_key, definition) => {
  MALFORMED_HASHES.forEach((hash) => {
    expect(definition.capabilities.issueRead?.parseIntegrationHash(hash)).toBeNull()
  })
})

it.each(searchEntries)('%s: buildQuery answers an empty search', (_key, definition) => {
  expect(() => definition.capabilities.issueSearch?.buildQuery('', {})).not.toThrow()
})

it.each(searchEntries)('%s: buildQuery rejects meta it does not know', (_key, definition) => {
  const query = definition.capabilities.issueSearch?.buildQuery('bugs', {unknownMetaKey: 1})
  expect(query).toBeInstanceOf(Error)
  expect(query).toMatchObject({message: expect.stringContaining('unknownMetaKey')})
})

it.each(pushEntries)('%s: can push an estimate as a comment', (_key, definition) => {
  expect(definition.capabilities.estimatePush?.targets).toContain('comment')
})

it.each(listEntries)('%s: an issueList service is a ServiceEnum source', (key) => {
  expect(enumValues('ServiceEnum')).toContain(key)
})
