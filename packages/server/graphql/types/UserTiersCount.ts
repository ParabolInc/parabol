import {GraphQLInt, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveUser} from '../resolvers'
import User from './User'

const UserTiersCount = new GraphQLObjectType<any, GQLContext>({
  name: 'UserTiersCount',
  description: 'A count of the number of account tiers a user belongs to.',
  fields: () => ({
    tierPersonalCount: {
      type: GraphQLInt,
      description: 'The number of personal orgs the user is active upon'
    },
    tierProCount: {
      type: GraphQLInt,
      description: 'The number of pro orgs the user is active upon'
    },
    tierProBillingLeaderCount: {
      type: GraphQLInt,
      description: 'The number of pro orgs the user holds the role of Billing Leader'
    },
    user: {
      type: User,
      resolve: resolveUser
    }
  })
})

export default UserTiersCount
