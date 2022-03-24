import {loadFilesSync} from '@graphql-tools/load-files'
import {makeExecutableSchema, mergeSchemas} from '@graphql-tools/schema'
import path from 'path'
import composeResolvers from '../composeResolvers'
import publicSchema from '../public/rootSchema'
import resolveTypesForMutationPayloads from '../resolveTypesForMutationPayloads'
import permissions from './permissions'
import resolvers from './resolvers'

const typeDefs = loadFilesSync(
  path.join(__PROJECT_ROOT__, 'packages/server/graphql/private/typeDefs/*.graphql')
)

const shieldedSchema = makeExecutableSchema({
  typeDefs,
  resolvers: composeResolvers(resolvers, permissions)
})
const privateSchema = resolveTypesForMutationPayloads(shieldedSchema)
const fullSchema = mergeSchemas({schemas: [privateSchema, publicSchema]})
export default fullSchema
