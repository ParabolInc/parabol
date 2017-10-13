import {GraphQLList} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import getOrgUserCounts from 'server/graphql/queries/helpers/getOrgUserCounts';
import Organization from 'server/graphql/types/Organization';
import {getUserId} from 'server/utils/authorization';
import {BILLING_LEADER} from 'universal/utils/constants';

export default {
  description: 'Get the list of all organizations wher the userId is a billing leader',
  type: new GraphQLList(Organization),
  async resolve(source, args, {authToken}) {
    const r = getRethink();
    const userId = getUserId(authToken);

    // RESOLUTION
    return r.table('Organization')
      .getAll(userId, {index: 'orgUsers'})
      .filter((org) => org('orgUsers')
        .contains((orgUser) => orgUser('id').eq(userId).and(orgUser('role').eq(BILLING_LEADER))))
      .merge(getOrgUserCounts)
      .orderBy('name');
  }
};
