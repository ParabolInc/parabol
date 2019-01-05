import {GraphQLInt, GraphQLBoolean, GraphQLString} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {requireSU} from 'server/utils/authorization'
import OrgTierEnum from 'server/graphql/types/OrgTierEnum'
import {PRO} from 'universal/utils/constants'

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
      description: 'which tier of org shall we count?'
    }
  },
  async resolve (source, {ignoreEmailRegex, includeInactive, minOrgSize, tier}, {authToken}) {
    const r = getRethink()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    return r
      .table('Organization')
      .getAll(tier, {index: 'tier'})
      .merge((organization) => ({
        users: r
          .table('OrganizationUser')
          .getAll(organization('id'), {index: 'orgId'})
          .filter({removedAt: null})
          .eqJoin('userId', r.table('User'))
          .zip()
          .filter((user) =>
            r.branch(
              r(ignoreEmailRegex).eq(''),
              true,
              user('email')
                .match(ignoreEmailRegex)
                .eq(null)
            )
          )
          .filter((user) => r.branch(includeInactive, true, user('inactive').not()))
          .count()
      }))
      .filter((org) => org('users').ge(minOrgSize))
      .count()
  }
}
