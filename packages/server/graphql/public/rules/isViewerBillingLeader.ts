import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'

const resolve = async (orgId: string, {authToken, dataLoader}: GQLContext) => {
  const viewerId = getUserId(authToken)
  const organizationUser = await dataLoader
    .get('organizationUsersByUserIdOrgId')
    .load({orgId, userId: viewerId})
  if (!organizationUser) return new Error('Organization User not found')
  const {role} = organizationUser
  if (role !== 'BILLING_LEADER' && role !== 'ORG_ADMIN')
    return new Error('User is not billing leader')
  return true
}

export const isViewerBillingLeader = rule({cache: 'strict'})(
  async (_source, {orgId}, context: GQLContext) => {
    return resolve(orgId, context)
  }
)

export const isViewerBillingLeaderSource = rule({cache: 'strict'})(
  async ({id: orgId}, _args, context: GQLContext) => {
    return resolve(orgId, context)
  }
)
