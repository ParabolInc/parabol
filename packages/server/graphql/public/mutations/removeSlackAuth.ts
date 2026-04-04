import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import removeSlackAuths from '../../mutations/helpers/removeSlackAuths'
import type {MutationResolvers} from '../resolverTypes'

const removeSlackAuth: MutationResolvers['removeSlackAuth'] = async (
  _source,
  {teamId},
  {authToken, socketId: mutatorId, dataLoader}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // RESOLUTION
  const [res, viewer] = await Promise.all([
    removeSlackAuths(viewerId, teamId, true),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!res.authIds) {
    return {error: {message: res.error ?? 'Failed to remove Slack auth'}}
  }
  const authId = res.authIds[0]

  analytics.integrationRemoved(viewer, teamId, 'slack')
  const data = {authId, teamId, userId: viewerId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveSlackAuthPayload', data, subOptions)
  return data
}

export default removeSlackAuth
