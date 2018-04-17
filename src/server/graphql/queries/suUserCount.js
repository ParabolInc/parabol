import {GraphQLBoolean, GraphQLInt, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSU} from 'server/utils/authorization';
import OrgTierEnum from 'server/graphql/types/OrgTierEnum';
import {PRO} from 'universal/utils/constants';


export default {
  type: GraphQLInt,
  args: {
    ignoreEmailRegex: {
      type: GraphQLString,
      defaultValue: '',
      description: 'filter out users who\'s email matches this regular expression'
    },
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
  async resolve(source, {ignoreEmailRegex, includeInactive, tier}, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    return r.table('Organization')
      .getAll(tier, {index: 'tier'})
      .map((org) => org.merge({
        orgUsers: org('orgUsers')
          .eqJoin((ou) => ou('id'), r.table('User'))
          .zip()
          .pluck('email', 'inactive')
      }))
      .coerceTo('array')
      .do((orgs) => r.branch(r.eq(ignoreEmailRegex, ''),
        orgs,
        orgs.map((org) => org.merge({
          orgUsers: org('orgUsers').filter((ou) => r.eq(ou('email').match(ignoreEmailRegex), null))
        }))
      ))
      .concatMap((org) => org('orgUsers')('inactive'))
      .count((inactive) => r.branch(includeInactive,
        true, // count everybody
        r.not(inactive)
      ));
  }
};
