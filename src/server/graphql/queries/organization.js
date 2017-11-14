import {GraphQLID, GraphQLNonNull} from 'graphql';
import Organization from 'server/graphql/types/Organization';
import {getUserId} from 'server/utils/authorization';
import {BILLING_LEADER} from 'universal/utils/constants';

export default {
  type: Organization,
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the orgId'
    }
  },
  description: 'get a single organization and the count of users by status',
  resolve: async (source, {orgId}, {authToken, getDataLoader}) => {
    // AUTH
    const userId = getUserId(authToken);
    const org = await getDataLoader().organization.load(orgId);

    const {orgUsers} = org;
    const myOrgUser = orgUsers.find((user) => user.id === userId);
    if (!myOrgUser || myOrgUser.role !== BILLING_LEADER) {
      throw new Error('Must be a billing leader');
    }

    // RESOLUTION
    return org;
  }
};
