import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import updateRepoIntegrationsCacheByPerms from '../../queries/helpers/updateRepoIntegrationsCacheByPerms'
import type {MutationResolvers} from '../resolverTypes'

const removeGitHubAuth: MutationResolvers['removeGitHubAuth'] = async (
  _source,
  {teamId},
  {authToken, socketId: mutatorId, dataLoader}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // AUTH
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // RESOLUTION
  const [viewer] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    getKysely()
      .updateTable('GitHubAuth')
      .set({isActive: false})
      .where('userId', '=', viewerId)
      .where('teamId', '=', teamId)
      .where('isActive', '=', true)
      .execute()
  ])
  updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, false)
  analytics.integrationRemoved(viewer, teamId, 'github')

  const data = {teamId, userId: viewerId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveGitHubAuthPayload', data, subOptions)
  return data
}

export default removeGitHubAuth
