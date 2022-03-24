import {loadFilesSync} from '@graphql-tools/load-files'
import {makeExecutableSchema, mergeSchemas} from '@graphql-tools/schema'
import path from 'path'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import publicSchema from '../rootSchema'
import resolvers from './resolvers'

// const publicSchema = new GraphQLSchema({
//   query,
//   mutation,
//   types: rootTypes
// })

const typeDefs = loadFilesSync(
  path.join(__PROJECT_ROOT__, 'packages/server/graphql/private/typeDefs/*.graphql')
)

const privateSchema = resolveTypesForMutationPayloads(makeExecutableSchema({typeDefs, resolvers}))
// const publicSchema = require('../rootSchema').default
// console.log({publicSchema})
// required to get the public types
const fullSchema = mergeSchemas({schemas: [privateSchema, publicSchema]})
export default fullSchema
