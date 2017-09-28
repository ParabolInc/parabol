import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
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
  description: 'all the notifications for a single user',
  resolve: async (source, {orgId}, {authToken}) => {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);

    const org = await r.table('Organization').get(orgId);

    const {orgUsers} = org;
    const myOrgUser = orgUsers.find((user) => user.id === userId);
    if (!myOrgUser || myOrgUser.role !== BILLING_LEADER) {
      throw new Error('Must be a billing leader');
    }

    const inactiveUserCount = orgUsers.filter((user) => user.inactive);
    const activeUserCount = orgUsers.length - inactiveUserCount;

    return {
      ...org,
      inactiveUserCount,
      activeUserCount
    };
  }
};
