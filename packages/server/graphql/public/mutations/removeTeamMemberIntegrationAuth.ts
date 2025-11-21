import getKysely from '../../../postgres/getKysely'
import type {Integrationproviderserviceenum} from '../../../postgres/types/pg'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import updateRepoIntegrationsCacheByPerms from '../../queries/helpers/updateRepoIntegrationsCacheByPerms'
import type {MutationResolvers} from '../resolverTypes'

const removeTeamMemberIntegrationAuth: MutationResolvers['removeTeamMemberIntegrationAuth'] =
  async (_source, {service, teamId}, context) => {
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId))
      return standardError(new Error('permission denied; must be team member'))
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
    updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, false)
    analytics.integrationRemoved(viewer, teamId, service)

    const data = {userId: viewerId, teamId, service}
    return data
  }

export default removeTeamMemberIntegrationAuth
