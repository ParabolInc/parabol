import {GraphQLBoolean, GraphQLInt, GraphQLString} from 'graphql'
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
    tier: {
      type: TierEnum,
      defaultValue: ETierEnum.pro,
      description: 'which tier of org shall we count?'
    }
  },
  async resolve(_source, {ignoreEmailRegex, includeInactive, tier}, {authToken}) {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    if (!ignoreEmailRegex && !includeInactive)
      return (r
        .table('OrganizationUser')
        .getAll([tier, false], {index: 'tierInactive'})
        .filter({removedAt: null})
        .group('userId') as any)
        .count()
        .ungroup()
        .count()
        .run()

    return (r
      .table('OrganizationUser')
      .filter((orgUser) => orgUser('tier').eq(tier))
      .filter({removedAt: null})
      .filter((orgUser) => r.branch(includeInactive, true, orgUser('inactive').not()))
      .eqJoin('userId', r.table('User'))
      .zip() as any)
      .filter((result) =>
        r.branch(
          r(ignoreEmailRegex).eq(''),
          true,
          result('email')
            .match(ignoreEmailRegex)
            .eq(null)
        )
      )
      .group('userId')
      .count()
      .ungroup()
      .count()
      .run()
  }
}
