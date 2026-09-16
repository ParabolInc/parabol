import fs from 'fs'
import {type GraphQLResolveInfo, Kind, parse, type TypeNode} from 'graphql'
import path from 'path'
import type {RemoteRepoIntegration} from '../../../../integrations/platform/RemoteRepoIntegration'
import type {GQLContext} from '../../../graphql'
import RepoIntegration from '../RepoIntegration'

const TYPEDEF_PREFIX_BY_SERVICE = {
  azureDevOps: 'AzureDevOps',
  github: 'GitHub',
  gitlab: 'GitLab',
  jira: 'Jira',
  jiraServer: 'JiraServer',
  linear: 'Linear'
} as const

const namedType = (type: TypeNode): string =>
  type.kind === Kind.NAMED_TYPE ? type.name.value : namedType(type.type)

const declaredReposType = (prefix: string) => {
  const typeName = `${prefix}IntegrationService`
  const sdl = fs.readFileSync(path.join(__dirname, `../../typeDefs/${typeName}.graphql`), 'utf8')
  const definition = parse(sdl).definitions.find(
    (def) => def.kind === Kind.OBJECT_TYPE_DEFINITION && def.name.value === typeName
  )
  if (definition?.kind !== Kind.OBJECT_TYPE_DEFINITION) throw new Error(`No ${typeName} in the SDL`)
  const repos = definition.fields?.find((field) => field.name.value === 'repos')
  if (!repos) throw new Error(`No repos field on ${typeName}`)
  return namedType(repos.type)
}

const resolvedReposType = (service: string) => {
  const resolver = RepoIntegration.__resolveType
  if (typeof resolver !== 'function') throw new Error('resolver must be a function')
  return resolver(
    {service} as unknown as RemoteRepoIntegration,
    {} as unknown as GQLContext,
    {} as GraphQLResolveInfo
  )
}

it.each(Object.entries(TYPEDEF_PREFIX_BY_SERVICE))(
  'the %s SDL narrows repos to the type __resolveType returns',
  (service, prefix) => {
    expect(declaredReposType(prefix)).toBe(resolvedReposType(service))
  }
)
