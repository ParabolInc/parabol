/*
 * Combine type definitions and resolvers from multiple sources
 *  - legacy GraphQLObjectType types from `../types` which are defined TypeScript first
 *  - new SDL first types with definitions in `typeDefs` and resolvers in `types`
 *  - GitHub, GitLab and Linear schemas
 */
import {addResolversToSchema, mergeSchemas} from '@graphql-tools/schema'
import type {GraphQLSchema} from 'graphql'
import {mergeNestedUsage, type NestedUsage, nestGraphQLEndpoints} from 'nest-graphql-endpoint'
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
      .map(([typeName, fieldResolvers]) => [typeName, Object.keys(fieldResolvers ?? {})])
  )

const buildPublicSchema = (nestedUsage: NestedUsage | null) => {
  const typeDefsWithNestedEndpoints = nestGraphQLEndpoints(parabolTypeDefs, nestedEndpoints, {
    ...schemaBuildOptions,
    usage:
      nestedUsage &&
      mergeNestedUsage(nestedUsage, getResolverUsage(resolvers), getResolverUsage(permissions))
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

// A production build only has the nested types & fields that the app's persisted operations use
const nestedUsage: NestedUsage | null = __NESTED_USAGE__
const publicSchema = buildPublicSchema(nestedUsage)
export const hasEveryNestedType = !nestedUsage

let publicSchemaWithAllNestedTypes: GraphQLSchema | undefined
// For an operation that uses a nested field the app doesn't, e.g. one sent with a personal access token
export const getPublicSchemaWithAllNestedTypes = () => {
  if (hasEveryNestedType) return publicSchema
  publicSchemaWithAllNestedTypes ??= buildPublicSchema(null)
  return publicSchemaWithAllNestedTypes
}

export const githubRequest = github.request
export const gitlabRequest = gitlab.request
export const linearRequest = linear.request
export default publicSchema
