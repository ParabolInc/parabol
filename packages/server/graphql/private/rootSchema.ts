import {loadFilesSync} from '@graphql-tools/load-files'
import {makeExecutableSchema, mergeSchemas} from '@graphql-tools/schema'
import path from 'path'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import publicSchema from '../rootSchema'
import resolvers from './resolvers'

const typeDefs = loadFilesSync(
  path.join(__PROJECT_ROOT__, 'packages/server/graphql/private/typeDefs/*.graphql')
)

console.log(typeDefs)
const privateSchema = resolveTypesForMutationPayloads(makeExecutableSchema({typeDefs, resolvers}))
const fullSchema = mergeSchemas({schemas: [privateSchema, publicSchema]})
export default fullSchema
