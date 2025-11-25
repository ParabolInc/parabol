import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const toggleMCPResource: MutationResolvers['toggleMCPResource'] = async (
  _source,
  {orgId, resource, enabled},
  {authToken, dataLoader}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)

  // AUTH: Check if user is org admin
  const isOrgAdmin = await isUserOrgAdmin(viewerId, orgId, dataLoader)
  if (!isOrgAdmin) {
    return standardError(new Error('Must be organization admin'), {userId: viewerId})
  }

  // VALIDATION: Check resource is valid
  const validResources = ['organizations', 'teams', 'pages']
  if (!validResources.includes(resource)) {
    return standardError(new Error('Invalid resource type'), {userId: viewerId})
  }

  // RESOLUTION: Update organization mcpResources
  const org: any = await pg
    .selectFrom('Organization')
    .select(['id', 'mcpResources' as any])
    .where('id', '=', orgId)
    .executeTakeFirst()

  if (!org) {
    return standardError(new Error('Organization not found'), {userId: viewerId})
  }

  const mcpResources = org.mcpResources || {organizations: false, teams: false, pages: false}
  mcpResources[resource] = enabled

  await pg
    .updateTable('Organization')
    .set({mcpResources: mcpResources as any})
    .where('id', '=', orgId)
    .execute()

  // Clear cache and reload organization
  dataLoader.clearAll('organizations')
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)

  const data = {organization}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'ToggleMCPResourceSuccess', data, {})

  return data
}

export default toggleMCPResource
