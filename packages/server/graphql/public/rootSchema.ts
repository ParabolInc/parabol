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
import {nestGraphQLEndpoints} from '../nestedSchema/nestGraphQLEndpoint'
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

const {endpoint: github, githubRequest} = nestGitHub()
const {endpoint: gitlab, gitlabRequest} = nestGitLab()
const {endpoint: linear, linearRequest} = nestLinear()
const typeDefsWithGitHubGitLabLinear = nestGraphQLEndpoints(
  parabolTypeDefs,
  [github, gitlab, linear],
  schemaBuildOptions
)

// IMPORTANT! mergeSchemas has a bug where resolvers will be overwritten by the default resolvers
// See https://github.com/ardatan/graphql-tools/issues/4367
const publicSchema = applyScopeDirective(
  resolveTypesForMutationPayloads(
    addResolversToSchema({
      schema: typeDefsWithGitHubGitLabLinear,
      resolvers: composeResolvers(resolvers, permissions, typeDefsWithGitHubGitLabLinear),
      inheritResolversFromInterfaces: true,
      updateResolversInPlace: schemaBuildOptions.updateResolversInPlace
    })
  )
)

export {githubRequest, gitlabRequest, linearRequest}
export default publicSchema
