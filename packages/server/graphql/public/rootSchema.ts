/*
 * Combine type definitions and resolvers from multiple sources
 *  - legacy GraphQLObjectType types from `../types` which are defined TypeScript first
 *  - new SDL first types with definitions in `typeDefs` and resolvers in `types`
 *  - GitHub, GitLab and Linear schemas
 */
import {addResolversToSchema, mergeSchemas} from '@graphql-tools/schema'
import {type DocumentNode, type GraphQLSchema, Kind, parse} from 'graphql'
import {
  mergeNestedUsage,
  type NestedEndpoint,
  type NestedUsage,
  nestGraphQLEndpoints
} from 'nest-graphql-endpoint'
import {Logger} from '../../utils/Logger'
// Resolvers from SDL first definitions
import {nestGitHub} from '../../utils/nestGitHub'
import composeResolvers from '../composeResolvers'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import schemaBuildOptions from '../schemaBuildOptions'
import {applyScopeDirective} from './applyScopeDirective'
import {typeDefs} from './importedTypeDefs'
import {nestGitLab} from './nestGitLab'
import {nestLinear} from './nestLinear'
import permissions from './permissions'
import resolvers from './resolvers'

// Merge old POJO definitions with SDL definitions
const parabolTypeDefs = mergeSchemas({
  typeDefs,
  ...schemaBuildOptions
})

const github = nestGitHub()
const gitlab = nestGitLab()
const linear = nestLinear()
export const nestedEndpoints = [github, gitlab, linear]
const nestedPrefixes = nestedEndpoints.map(({prefix}) => prefix)

// Parabol's own resolvers & permissions on nested types need those fields
const getResolverUsage = (resolverMap: Record<string, object | undefined>): NestedUsage =>
  Object.fromEntries(
    Object.entries(resolverMap)
      .filter(([typeName]) => nestedPrefixes.some((prefix) => typeName.startsWith(prefix)))
      .map(([typeName, fieldResolvers]) => [
        typeName,
        Object.keys(fieldResolvers ?? {}).filter(
          (fieldName) => fieldName !== '*' && !fieldName.startsWith('__')
        )
      ])
  )
const resolverUsage = mergeNestedUsage(getResolverUsage(resolvers), getResolverUsage(permissions))

const buildPublicSchema = (endpoints: NestedEndpoint[], nestedUsage: NestedUsage | null) => {
  const typeDefsWithNestedEndpoints = nestGraphQLEndpoints(parabolTypeDefs, endpoints, {
    ...schemaBuildOptions,
    usage: nestedUsage && mergeNestedUsage(nestedUsage, resolverUsage)
  })
  // IMPORTANT! mergeSchemas has a bug where resolvers will be overwritten by the default resolvers
  // See https://github.com/ardatan/graphql-tools/issues/4367
  return applyScopeDirective(
    resolveTypesForMutationPayloads(
      addResolversToSchema({
        schema: typeDefsWithNestedEndpoints,
        resolvers: composeResolvers(resolvers, permissions, typeDefsWithNestedEndpoints),
        inheritResolversFromInterfaces: true,
        updateResolversInPlace: schemaBuildOptions.updateResolversInPlace
      })
    )
  )
}

const hasField = (typeDefs: DocumentNode, typeName: string, fieldName: string) =>
  typeDefs.definitions.some(
    (definition) =>
      (definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
        definition.kind === Kind.OBJECT_TYPE_EXTENSION ||
        definition.kind === Kind.INTERFACE_TYPE_DEFINITION ||
        definition.kind === Kind.INTERFACE_TYPE_EXTENSION) &&
      definition.name.value === typeName &&
      !!definition.fields?.some((field) => field.name.value === fieldName)
  )

// The build pruned each endpoint's types, so the server parses only those instead of every endpoint's whole SDL.
// If the build left out an endpoint, or a field that Parabol's own resolvers need, the server prunes them itself
const getEndpointsPrunedAtBuild = (typeDefsByPrefix: Record<string, string>) => {
  const endpoints: NestedEndpoint[] = []
  for (const endpoint of nestedEndpoints) {
    const sdl = typeDefsByPrefix[endpoint.prefix]
    if (sdl === undefined) {
      Logger.warn(
        `The build didn't prune ${endpoint.prefix}, so the server prunes nested types itself`
      )
      return null
    }
    const typeDefs = parse(sdl, {noLocation: true})
    for (const [typeName, fieldNames] of Object.entries(resolverUsage)) {
      if (!typeName.startsWith(endpoint.prefix)) continue
      const missingField = fieldNames.find((fieldName) => !hasField(typeDefs, typeName, fieldName))
      if (missingField !== undefined) {
        Logger.warn(
          `The build left out ${typeName}.${missingField}, which has a resolver, so the server prunes nested types itself`
        )
        return null
      }
    }
    endpoints.push({...endpoint, getTypeDefs: () => typeDefs})
  }
  return endpoints
}

// A production build only has the nested types & fields that the app's persisted operations use
const nestedUsage: NestedUsage | null = __NESTED_USAGE__
const nestedTypeDefs: Record<string, string> | null = __NESTED_TYPE_DEFS__
const endpointsPrunedAtBuild = nestedTypeDefs && getEndpointsPrunedAtBuild(nestedTypeDefs)
const publicSchema = endpointsPrunedAtBuild
  ? buildPublicSchema(endpointsPrunedAtBuild, null)
  : buildPublicSchema(nestedEndpoints, nestedUsage)
export const hasEveryNestedType = !nestedUsage

let publicSchemaWithAllNestedTypes: GraphQLSchema | undefined
// For an operation that uses a nested field the app doesn't, e.g. one sent with a personal access token
export const getPublicSchemaWithAllNestedTypes = () => {
  if (hasEveryNestedType) return publicSchema
  publicSchemaWithAllNestedTypes ??= buildPublicSchema(nestedEndpoints, null)
  return publicSchemaWithAllNestedTypes
}

export const githubRequest = github.request
export const gitlabRequest = gitlab.request
export const linearRequest = linear.request
export default publicSchema
