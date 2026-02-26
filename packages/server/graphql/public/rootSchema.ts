/*
 * Combine type definitions and resolvers from multiple sources
 *  - legacy GraphQLObjectType types from `../types` which are defined TypeScript first
 *  - new SDL first types with definitions in `typeDefs` and resolvers in `types`
 *  - GitHub and GitLab schemas
 */
import {addResolversToSchema, mergeSchemas} from '@graphql-tools/schema'
// Resolvers from SDL first definitions
import {nestGitHub} from '../../utils/nestGitHub'
import composeResolvers from '../composeResolvers'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import {typeDefs} from './importedTypeDefs'
import {nestGitLab} from './nestGitLab'
import {nestLinear} from './nestLinear'
import permissions from './permissions'
import resolvers from './resolvers'

// Merge old POJO definitions with SDL definitions
const parabolTypeDefs = mergeSchemas({
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
