/* This file dynamically requires all queries, mutations, and types.
 * No need to mess with this unless we add subscriptions to the private schema
 */
import path from 'path'
import {Resolvers} from './resolverTypes'

const importAll = (context: __WebpackModuleApi.RequireContext) => {
  const collector = {} as Record<string, any>
  context.keys().forEach((relativePath) => {
    const {name} = path.parse(relativePath)
    collector[name] = context(relativePath).default
  })
  return collector
}

const resolverMap: Resolvers = {
  Mutation: {
    ...importAll(require.context('./mutations', false, /.ts$/))
  },
  Query: {
    ...importAll(require.context('./queries', false, /.ts$/))
  },
  ...importAll(require.context('./types', false, /.ts$/))
}

export default resolverMap
