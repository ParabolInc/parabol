import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import {getUserId} from 'server/utils/authorization';
import {ORGANIZATION_UPDATED} from 'universal/utils/constants';


export default {
  type: new GraphQLNonNull(AddOrgPayload),
  subscribe: async (source, args, {authToken, socketId}) => {
    const r = getRethink();
    // AUTH
    const userId = getUserId(authToken);
    const orgIds = await r.table('Organization').getAll(userId, {index: 'orgUsers'})('id').default(null);
    if (!orgIds || orgIds.length < 1) {
      throw new Error('User is not a part of any organizations');
    }

    // RESOLUTION
    const channelNames = orgIds.map((id) => `${ORGANIZATION_UPDATED}.${id}`);
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelNames, {filterFn});
  }
};
