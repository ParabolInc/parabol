import {GraphQLInt} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSU} from 'server/utils/authorization';
import {PRO} from 'universal/utils/constants';


export default {
  type: GraphQLInt,
  async resolve(source, args, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    return r.table('Organization')
      .getAll(PRO, {index: 'tier'})
      .concatMap((org) => org('orgUsers')('inactive'))
      .count((inactive) => r.not(inactive));
  }
};
