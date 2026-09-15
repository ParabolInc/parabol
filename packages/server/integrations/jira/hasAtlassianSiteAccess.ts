import getKysely from '../../postgres/getKysely'
import type {AtlassianAuth} from '../../postgres/types'
import AtlassianServerManager from '../../utils/AtlassianServerManager'

const hasAtlassianSiteAccess = async (auth: AtlassianAuth, cloudId: string): Promise<boolean> => {
  if (auth.cloudIds.includes(cloudId)) return true
  // stored cloudIds lag behind sites granted after consent; the site picker lists
  // sites live, so confirm against the live list before rejecting
  const sites = await new AtlassianServerManager(auth.accessToken).getAccessibleResources()
  if (!Array.isArray(sites) || !sites.some(({id}) => id === cloudId)) return false
  await getKysely()
    .updateTable('TeamMemberIntegrationAuth')
    .set({meta: JSON.stringify({cloudIds: sites.map(({id}) => id)})})
    .where('userId', '=', auth.userId)
    .where('providerId', '=', auth.providerId)
    .where('providerUserId', '=', auth.providerUserId)
    .where('isActive', '=', true)
    .execute()
  return true
}

export default hasAtlassianSiteAccess
