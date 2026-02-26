import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {selectAtlassianAuth} from '../../../postgres/select'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import updateRepoIntegrationsCacheByPerms from '../../queries/helpers/updateRepoIntegrationsCacheByPerms'
import type {MutationResolvers} from '../resolverTypes'

const removeAtlassianAuth: MutationResolvers['removeAtlassianAuth'] = async (
  _source,
  {teamId},
  {authToken, socketId: mutatorId, dataLoader}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  // AUTH
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // RESOLUTION
  const [existingAuth, viewer] = await Promise.all([
    selectAtlassianAuth()
      .where('userId', '=', viewerId)
      .where('teamId', '=', teamId)
      .where('isActive', '=', true)
      .executeTakeFirst(),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!existingAuth) {
    return standardError(new Error('Auth not found'), {userId: viewerId})
  }

  await pg
    .updateTable('AtlassianAuth')
    .set({isActive: false})
    .where('userId', '=', viewerId)
    .where('teamId', '=', teamId)
    .where('isActive', '=', true)
    .execute()

  updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, false)
  analytics.integrationRemoved(viewer, teamId, 'jira')

  const data = {teamId, userId: viewerId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveAtlassianAuthPayload', data, subOptions)
  return data
}

export default removeAtlassianAuth
