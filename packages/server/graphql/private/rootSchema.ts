import {makeExecutableSchema} from '@graphql-tools/schema'
import {getResolversFromSchema} from '@graphql-tools/utils'
import composeResolvers from '../composeResolvers'
import {typeDefs as publicTypeDefs} from '../public/importedTypeDefs'
import publicSchema from '../public/rootSchema'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import schemaBuildOptions from '../schemaBuildOptions'
import {typeDefs} from './importedTypeDefs'
import permissions from './permissions'
import resolvers from './resolvers'

const shieldedSchema = makeExecutableSchema({
  typeDefs: typeDefs.concat(publicTypeDefs),
  resolvers: composeResolvers(resolvers, permissions),
  ...schemaBuildOptions
})
const privateSchema = resolveTypesForMutationPayloads(shieldedSchema)

// mergeSchemas without its search for extensions, which copies both schemas to find none
const fullSchema = makeExecutableSchema({
  typeDefs: [privateSchema, publicSchema],
  resolvers: [getResolversFromSchema(privateSchema), getResolversFromSchema(publicSchema)],
  ...schemaBuildOptions
})
export default fullSchema
