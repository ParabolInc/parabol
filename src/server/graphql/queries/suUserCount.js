import {GraphQLBoolean, GraphQLInt} from 'graphql';
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
      .concatMap((org) => org('orgUsers')('inactive'))
      .count((inactive) => r.branch(includeInactive,
        true, // count everybody
        r.not(inactive)
      ));
  }
};
