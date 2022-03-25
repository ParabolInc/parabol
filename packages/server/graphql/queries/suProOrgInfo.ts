import {GQLContext} from './../graphql'
import {GraphQLBoolean, GraphQLList, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {requireSU} from '../../utils/authorization'
import Organization from '../types/Organization'
import {RValue} from '../../database/stricterR'

export default {
  type: new GraphQLList(new GraphQLNonNull(Organization)),
  args: {
    includeInactive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      defaultValue: false,
      description: 'should organizations without active users be included?'
    }
  },
  async resolve(
    _source: unknown,
    {includeInactive}: {includeInactive: boolean},
    {authToken}: GQLContext
  ) {
    const r = await getRethink()

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    return r
      .table('Organization')
      .getAll('pro', {index: 'tier'})
      .merge((organization: RValue) => ({
        users: r
          .table('OrganizationUser')
          .getAll(organization('id'), {index: 'orgId'})
          .filter({removedAt: null})
          .filter((user) => r.branch(includeInactive, true, user('inactive').not()))
          .count()
      }))
      .filter((org: RValue) => r.branch(includeInactive, true, org('users').ge(1)))
      .run()
  }
}
