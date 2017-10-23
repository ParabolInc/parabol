import {GraphQLList} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import Organization from 'server/graphql/types/Organization';
import {getUserId} from 'server/utils/authorization';
import getOrgUserCounts from 'server/graphql/queries/helpers/getOrgUserCounts';

export default {
  description: 'Get the list of all organizations a user belongs to',
  type: new GraphQLList(Organization),
  async resolve(source, args, {authToken}) {
    const r = getRethink();
    const userId = getUserId(authToken);

    // RESOLUTION
    return r.table('Organization')
      .getAll(userId, {index: 'orgUsers'})
      // TODO remove this & fetch it via a dataloader
      .merge(getOrgUserCounts)
      .orderBy('name');
  }
};
