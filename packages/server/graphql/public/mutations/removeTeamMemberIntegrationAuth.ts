import invalidateRepoIntegrationsCache from '../../../integrations/invalidateRepoIntegrationsCache'
import {integrationChanges} from '../../../metricsHandler'
import getKysely from '../../../postgres/getKysely'
import type {Integrationproviderserviceenum} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const removeTeamMemberIntegrationAuth: MutationResolvers['removeTeamMemberIntegrationAuth'] =
  async (_source, {service, teamId}, context) => {
    const {authToken} = context
    const viewerId = getUserId(authToken)

    const pg = getKysely()
    // RESOLUTION
    await pg
      .updateTable('TeamMemberIntegrationAuth')
      .set({isActive: false, meta: null})
      .where('userId', '=', viewerId)
      .where('teamId', '=', teamId)
      .where('service', '=', service as Integrationproviderserviceenum)
      .where('isActive', '=', true)
      .execute()
    await invalidateRepoIntegrationsCache(teamId, viewerId, service, 'removed')
    integrationChanges.inc({service, change: 'removed'})

    const data = {userId: viewerId, teamId, service}
    return data
  }

export default removeTeamMemberIntegrationAuth
