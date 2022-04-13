import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import {QueryResolvers} from '../resolverTypes'

const suProOrgInfo: QueryResolvers['suProOrgInfo'] = async (_source, {includeInactive}) => {
  const r = await getRethink()
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

export default suProOrgInfo
