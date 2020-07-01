import {GraphQLInt, GraphQLBoolean, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {requireSU} from '../../utils/authorization'
import {TierEnum as ETierEnum} from 'parabol-client/types/graphql'
import TierEnum from '../types/TierEnum'

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
      type: TierEnum,
      defaultValue: ETierEnum.pro,
      description: 'which tier of org shall we count?'
    }
  },
  async resolve(_source, {ignoreEmailRegex, includeInactive, minOrgSize, tier}, {authToken}) {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    if (!ignoreEmailRegex)
      return r
        .table('OrganizationUser')
        .filter((orgUser) => orgUser('inactive').not())
        .filter({removedAt: null})
        .filter((orgUser) => orgUser('tier').eq(tier))
        .group('orgId')
        .count()
        .ungroup()
        .filter((group) => group('reduction').ge(minOrgSize))
        .count()
        .run()

    return r
      .table('OrganizationUser')
      .filter((orgUser) => orgUser('inactive').not())
      .filter({removedAt: null})
      .filter((orgUser) => orgUser('tier').eq(tier))
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
      .group('orgId')
      .count()
      .ungroup()
      .filter((group) => group('reduction').ge(minOrgSize))
      .count()
      .run()
  }
}
