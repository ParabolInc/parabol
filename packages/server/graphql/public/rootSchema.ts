/*
 * Combine type definitions and resolvers from multiple sources
 *  - legacy GraphQLObjectType types from `../types` which are defined TypeScript first
 *  - new SDL first types with definitions in `typeDefs` and resolvers in `types`
 *  - GitHub and GitLab schemas
 */
import {addResolversToSchema, mergeSchemas} from '@graphql-tools/schema'
import {GraphQLObjectType, GraphQLSchema} from 'graphql'
import composeResolvers from '../composeResolvers'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import mutation from '../rootMutation'
import query from '../rootQuery'
import rootTypes from '../rootTypes'
import {typeDefs} from './importedTypeDefs'
import permissions from './permissions'
// Resolvers from SDL first definitions
import {nestGitHub} from '../../utils/nestGitHub'
import {nestGitLab} from './nestGitLab'
import {nestLinear} from './nestLinear'
import resolvers from './resolvers'

// Schema from legacy TypeScript first definitions instead of SDL pattern
const legacyTypeDefs = new GraphQLSchema({
  query,
  mutation,
  // defining a placeholder subscription because there's a bug in nest-graphql-schema that prefixes to _xGitHubSubscription if missing
  subscription: new GraphQLObjectType({name: 'Subscription', fields: {}}),
  types: rootTypes
})

// Merge old POJO definitions with SDL definitions
const parabolTypeDefs = mergeSchemas({
  schemas: [legacyTypeDefs],
  typeDefs
})

const {schema: typeDefsWithGitHub, githubRequest} = nestGitHub(parabolTypeDefs)
const {schema: typeDefsWithGitHubGitLab, gitlabRequest} = nestGitLab(typeDefsWithGitHub)
const {schema: typeDefsWithGitHubGitLabLinear, linearRequest} = nestLinear(typeDefsWithGitHubGitLab)

// IMPORTANT! mergeSchemas has a bug where resolvers will be overwritten by the default resolvers
// See https://github.com/ardatan/graphql-tools/issues/4367
const publicSchema = resolveTypesForMutationPayloads(
  addResolversToSchema({
    schema: typeDefsWithGitHubGitLabLinear,
    resolvers: composeResolvers(resolvers, permissions),
    inheritResolversFromInterfaces: true
  })
)

export {githubRequest, gitlabRequest, linearRequest}
export default publicSchema
