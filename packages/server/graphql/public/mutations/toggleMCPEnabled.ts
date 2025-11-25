import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const toggleMCPEnabled: MutationResolvers['toggleMCPEnabled'] = async (
  _source,
  {orgId, enabled},
  {authToken, dataLoader}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)

  // AUTH: Check if user is org admin
  const isOrgAdmin = await isUserOrgAdmin(viewerId, orgId, dataLoader)
  if (!isOrgAdmin) {
    return standardError(new Error('Must be organization admin'), {userId: viewerId})
  }

  // RESOLUTION: Update organization mcpEnabled
  const org: any = await pg
    .selectFrom('Organization')
    .select(['id', 'mcpEnabled' as any])
    .where('id', '=', orgId)
    .executeTakeFirst()

  if (!org) {
    return standardError(new Error('Organization not found'), {userId: viewerId})
  }

  await pg
    .updateTable('Organization')
    .set({mcpEnabled: enabled as any})
    .where('id', '=', orgId)
    .execute()

  // Clear cache and reload organization
  dataLoader.clearAll('organizations')
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)

  const data = {organization}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'ToggleMCPEnabledSuccess', data, {})

  return data
}

export default toggleMCPEnabled
