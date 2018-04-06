import {GraphQLInt, GraphQLBoolean, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSU} from 'server/utils/authorization';
import OrgTierEnum from 'server/graphql/types/OrgTierEnum';
import {PRO} from 'universal/utils/constants';

export default {
  type: GraphQLInt,
  args: {
    includeInactive: {
      type: GraphQLBoolean,
      defaultValue: false,
      description: 'should organizations without active users be included?'
    },
    tier: {
      type: OrgTierEnum,
      defaultValue: PRO,
      descrption: 'which tier of org shall we count?'
    }
  },
  async resolve(source, {includeInactive, tier}, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    return r.table('Organization')
      .getAll(tier, {index: 'tier'})
      .map((org) => r.branch(includeInactive,
        true, // count all orgs
        org('orgUsers')
        // calculate whether the org is active or not:
        //   reduces [bool, bool, bool] => bool
        //   where at least one false => true (active org)
        //   all true => false (inactive org)
          .fold(false, (acc, orgUser) => acc.or(r.not(orgUser('inactive'))))
      ))
      // count true values in sequence (# of active orgs)
      .count((possiblyActiveOrg) => possiblyActiveOrg);
  }
};
