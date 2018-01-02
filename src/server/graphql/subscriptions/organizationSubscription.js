import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import OrganizationSubscriptionPayload from 'server/graphql/types/OrganizationSubscriptionPayload';
import {getUserId} from 'server/utils/authorization';
import {BILLING_LEADER, ORGANIZATION} from 'universal/utils/constants';


export default {
  type: new GraphQLNonNull(OrganizationSubscriptionPayload),
  subscribe: async (source, args, {authToken, dataLoader, socketId}) => {
    // AUTH
    const viewerId = getUserId(authToken);
    const viewer = await dataLoader.get('users').load(viewerId);
    const orgIds = viewer.userOrgs
      .filter((userOrg) => userOrg.role === BILLING_LEADER)
      .map(({id}) => id);

    // RESOLUTION
    const channelNames = orgIds.concat(viewerId).map((id) => `${ORGANIZATION}.${id}`);
    const filterFn = (value) => value.mutatorId !== socketId;
    const resolve = ({data}) => ({organizationSubscription: data});
    return makeSubscribeIter(channelNames, {filterFn, dataLoader, resolve});
  }
};
