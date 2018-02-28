import {GraphQLInt} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSU} from 'server/utils/authorization';

export default {
  type: GraphQLInt,
  async resolve(source, args, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    return r.table('Organization')
      .filter((org) => org('tier').eq('pro'))
      .map((org) => org('orgUsers')
        // calculate whether the org is active or not:
        //   reduces [bool, bool, bool] => bool
        //   where at least one false => true (active org)
        //   all true => false (inactive org)
        .fold(false, (acc, orgUser) => acc.or(r.not(orgUser('inactive'))))
      )
      // count true values in sequence (# of active orgs)
      .count((possiblyActiveOrg) => possiblyActiveOrg);
  }
};
