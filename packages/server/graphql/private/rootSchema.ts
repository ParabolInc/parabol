import {loadFilesSync} from '@graphql-tools/load-files'
import {makeExecutableSchema} from '@graphql-tools/schema'
import path from 'path'
import composeResolvers from '../composeResolvers'
import permissions from './permissions'
import resolvers from './resolvers'

const typeDefs = loadFilesSync(
  path.join(__PROJECT_ROOT__, 'packages/server/graphql/private/typeDefs/*.graphql')
)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: composeResolvers(resolvers, permissions)
})
export default schema
