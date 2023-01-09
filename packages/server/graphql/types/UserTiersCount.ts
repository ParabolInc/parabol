import {GraphQLInt, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveUser} from '../resolvers'
import User from './User'

const UserTiersCount = new GraphQLObjectType<any, GQLContext>({
  name: 'UserTiersCount',
  description: 'A count of the number of account tiers a user belongs to.',
  fields: () => ({
    tierStarterCount: {
      type: GraphQLInt,
      description: 'The number of starter orgs the user is active upon'
    },
    tierTeamCount: {
      type: GraphQLInt,
      description: 'The number of orgs on the team tier the user is active upon'
    },
    tierTeamBillingLeaderCount: {
      type: GraphQLInt,
      description: 'The number of orgs on the team tier the user holds the role of Billing Leader'
    },
    user: {
      type: User,
      resolve: resolveUser
    }
  })
})

export default UserTiersCount
