import {GraphQLInt, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {requireSU} from '../../utils/authorization'

export default {
  type: GraphQLInt,
  args: {
    tier: {
      type: GraphQLString,
      defaultValue: 'pro',
      description: 'which tier of org shall we count?'
    }
  },
  // Only counts users who are active
  async resolve(_source, {tier}, {authToken}) {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    return r
      .table('User')
      .filter({tier: tier, inactive: false})
      .count()
      .run()
  }
}
