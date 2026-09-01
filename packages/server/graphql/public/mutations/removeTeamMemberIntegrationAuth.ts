import invalidateRepoIntegrationsCache from '../../../integrations/invalidateRepoIntegrationsCache'
import getKysely from '../../../postgres/getKysely'
import type {Integrationproviderserviceenum} from '../../../postgres/types/pg'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const removeTeamMemberIntegrationAuth: MutationResolvers['removeTeamMemberIntegrationAuth'] =
  async (_source, {service, teamId}, context) => {
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)

    const pg = getKysely()
    // RESOLUTION
    const [viewer] = await Promise.all([
      dataLoader.get('users').loadNonNull(viewerId),
      pg
        .updateTable('TeamMemberIntegrationAuth')
        .set({isActive: false})
        .where('userId', '=', viewerId)
        .where('teamId', '=', teamId)
        .where('service', '=', service as Integrationproviderserviceenum)
        .where('isActive', '=', true)
        .execute()
    ])
    await invalidateRepoIntegrationsCache(teamId, viewerId, service, 'removed')
    analytics.integrationRemoved(viewer, teamId, service)

    const data = {userId: viewerId, teamId, service}
    return data
  }

export default removeTeamMemberIntegrationAuth
