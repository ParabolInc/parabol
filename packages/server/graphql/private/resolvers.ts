/* This file dynamically requires all queries, mutations, and types.
 * No need to mess with this unless we add subscriptions to the private schema
 */
import importAll from '../../utils/importAll'
import {Resolvers} from './resolverTypes'

const resolvers: Resolvers = {
  Mutation: {
    ...importAll(require.context('./mutations', false, /.ts$/))
  },
  Query: {
    ...importAll(require.context('./queries', false, /.ts$/))
  },
  ...importAll(require.context('./types', false, /.ts$/))
}

export default resolvers
