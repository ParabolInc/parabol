import {makeExecutableSchema, mergeSchemas} from '@graphql-tools/schema'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import publicSchema from '../rootSchema'
import resolvers from './resolvers'

const importAllStrings = (context: __WebpackModuleApi.RequireContext) => {
  return context.keys().map((id) => context(id).default)
}

const typeDefs = importAllStrings(require.context('./typeDefs', false, /.graphql$/))
const privateSchema = resolveTypesForMutationPayloads(makeExecutableSchema({typeDefs, resolvers}))
const fullSchema = mergeSchemas({schemas: [privateSchema, publicSchema]})
export default fullSchema
