import {makeExecutableSchema, mergeSchemas} from '@graphql-tools/schema'
import composeResolvers from '../composeResolvers'
import publicSchema from '../public/rootSchema'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import permissions from './permissions'
import resolvers from './resolvers'

const importAllStrings = (context: __WebpackModuleApi.RequireContext) => {
  return context.keys().map((id) => context(id).default)
}
const typeDefs = importAllStrings(require.context('./typeDefs', false, /.graphql$/))

const shieldedSchema = makeExecutableSchema({
  typeDefs,
  resolvers: composeResolvers(resolvers, permissions)
})
const privateSchema = resolveTypesForMutationPayloads(shieldedSchema)
const fullSchema = mergeSchemas({schemas: [privateSchema, publicSchema]})
export default fullSchema
