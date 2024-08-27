import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const setSlackNotification: MutationResolvers['setSlackNotification'] = async (
  _source,
  {slackChannelId, slackNotificationEvents, teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // AUTH
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
  }

  // VALIDATION
  const slackAuths = await dataLoader.get('slackAuthByUserId').load(viewerId)
  const slackAuth = slackAuths.find((auth) => auth.teamId === teamId)

  if (!slackAuth) {
    return standardError(new Error('Slack authentication not found'), {userId: viewerId})
  }

  // RESOLUTION
  const notifications = slackNotificationEvents.map((event) => ({
    event,
    channelId: slackChannelId,
    teamId,
    userId: viewerId,
    id: generateUID()
  }))
  const results = await pg
    .insertInto('SlackNotification')
    .values(notifications)
    .onConflict((oc) =>
      oc.columns(['teamId', 'userId', 'event']).doUpdateSet((eb) => ({
        channelId: eb.ref('excluded.channelId')
      }))
    )
    .returning('id')
    .execute()
  const slackNotificationIds = results.map(({id}) => id)
  const data = {userId: viewerId, slackNotificationIds}
  publish(SubscriptionChannel.TEAM, teamId, 'SetSlackNotificationPayload', data, subOptions)
  return data
}

export default setSlackNotification
