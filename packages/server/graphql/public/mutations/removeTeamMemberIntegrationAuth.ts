import {IntegrationProviderServiceEnum} from '../../../postgres/queries/generated/removeTeamMemberIntegrationAuthQuery'
import removeTeamMemberIntegrationAuthQuery from '../../../postgres/queries/removeTeamMemberIntegrationAuth'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import updateRepoIntegrationsCacheByPerms from '../../queries/helpers/updateRepoIntegrationsCacheByPerms'
import {MutationResolvers} from '../resolverTypes'

const removeTeamMemberIntegrationAuth: MutationResolvers['removeTeamMemberIntegrationAuth'] =
  async (_source, {service, teamId}, context) => {
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId))
      return standardError(new Error('permission denied; must be team member'))

    // RESOLUTION
    const [viewer] = await Promise.all([
      dataLoader.get('users').loadNonNull(viewerId),
      removeTeamMemberIntegrationAuthQuery(
        service as IntegrationProviderServiceEnum,
        teamId,
        viewerId
      )
    ])
    updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, false)
    analytics.integrationRemoved(viewer, teamId, service)

    const data = {userId: viewerId, teamId}
    return data
  }

export default removeTeamMemberIntegrationAuth
