import {GraphQLInt, GraphQLObjectType} from 'graphql';
import {resolveUser} from 'server/graphql/resolvers';
import User from 'server/graphql/types/User';

const UserTiersCount = new GraphQLObjectType({
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
});

export default UserTiersCount;
