import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateOrgPayload from 'server/graphql/types/UpdateOrgPayload';
import {getUserId, requireUserInOrg} from 'server/utils/authorization';
import {ORGANIZATION_UPDATED} from 'universal/utils/constants';


export default {
  type: new GraphQLNonNull(UpdateOrgPayload),
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: async (source, {orgId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    const userId = getUserId(authToken);
    const user = await dataLoader.get('users').load(userId);
    const userOrgDoc = user.userOrgs.find((userOrg) => userOrg.id === orgId);
    requireUserInOrg(userOrgDoc, userId, orgId);

    // RESOLUTION
    const channelName = `${ORGANIZATION_UPDATED}.${orgId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
