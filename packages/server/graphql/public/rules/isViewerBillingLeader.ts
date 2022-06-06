import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'

const isViewerBillingLeader = rule({cache: 'strict'})(
  async (_source, {orgId}, {authToken, dataLoader}: GQLContext) => {
    const viewerId = getUserId(authToken)
    const organizationUser = await dataLoader
      .get('organizationUsersByUserIdOrgId')
      .load({orgId, userId: viewerId})
    if (!organizationUser) return new Error('Organization User not found')
    const {role} = organizationUser
    if (role !== 'BILLING_LEADER') return new Error('User is not billing leader')
    return true
  }
)

export default isViewerBillingLeader
