import {GraphQLInt, GraphQLBoolean, GraphQLString} from 'graphql';
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
      description: "filter out users who's email matches this regular expression"
    },
    includeInactive: {
      type: GraphQLBoolean,
      defaultValue: false,
      description: 'should organizations without active users be included?'
    },
    minOrgSize: {
      type: GraphQLInt,
      defaultValue: 2,
      description: 'the minimum number of users within the org to count it'
    },
    tier: {
      type: OrgTierEnum,
      defaultValue: PRO,
      descrption: 'which tier of org shall we count?'
    }
  },
  async resolve (source, {ignoreEmailRegex, includeInactive, minOrgSize, tier}, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    return r
      .table('Organization')
      .getAll(tier, {index: 'tier'})
      .map((org) =>
        org.merge({
          orgUsers: org('orgUsers')
            .eqJoin((ou) => ou('id'), r.table('User'))
            .zip()
            .pluck('email', 'inactive')
        })
      )
      .coerceTo('array')
      .do((orgs) =>
        r.branch(
          r.eq(ignoreEmailRegex, ''),
          orgs,
          orgs.map((org) =>
            org.merge({
              orgUsers: org('orgUsers').filter((ou) =>
                r.eq(ou('email').match(ignoreEmailRegex), null)
              )
            })
          )
        )
      )
      .do((orgs) =>
        r.branch(
          includeInactive,
          orgs,
          orgs.map((org) =>
            org.merge({
              orgUsers: org('orgUsers').filter((ou) => r.not(ou('inactive')))
            })
          )
        )
      )
      .map((org) => org('orgUsers').count())
      .filter((c) => c.ge(minOrgSize))
      .count();
  }
};
