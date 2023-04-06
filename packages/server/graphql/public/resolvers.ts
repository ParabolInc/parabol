/* This file dynamically requires all queries, mutations, and types.
 * You shouldn't need to edit this
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
  Subscription: {
    ...importAll(require.context('./subscriptions', false, /.ts$/))
  },
  ...importAll(require.context('./types', false, /.ts$/))
}

export default resolvers
