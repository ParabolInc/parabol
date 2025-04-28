import {makeExecutableSchema, mergeSchemas} from '@graphql-tools/schema'
import composeResolvers from '../composeResolvers'
import {typeDefs as publicTypeDefs} from '../public/importedTypeDefs'
import publicSchema from '../public/rootSchema'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import {typeDefs} from './importedTypeDefs'
import permissions from './permissions'
import resolvers from './resolvers'

const shieldedSchema = makeExecutableSchema({
  typeDefs: typeDefs.concat(publicTypeDefs),
  resolvers: composeResolvers(resolvers, permissions)
})
const privateSchema = resolveTypesForMutationPayloads(shieldedSchema)

const fullSchema = mergeSchemas({schemas: [privateSchema, publicSchema]})
export default fullSchema
