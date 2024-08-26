import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import {RDatum} from '../../../database/stricterR'
import SlackNotification from '../../../database/types/SlackNotification'
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
  const r = await getRethink()

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
  const existingNotifications = await r
    .table('SlackNotification')
    .getAll(viewerId, {index: 'userId'})
    .filter({teamId})
    .filter((row: RDatum) => r(slackNotificationEvents).contains(row('event')))
    .run()

  const notifications = slackNotificationEvents.map((event) => {
    const existingNotification = existingNotifications.find(
      (notification) => notification.event === event
    )
    return new SlackNotification({
      event,
      channelId: slackChannelId,
      teamId,
      userId: viewerId,
      id: (existingNotification && existingNotification.id) || undefined
    })
  })
  await r.table('SlackNotification').insert(notifications, {conflict: 'replace'}).run()
  const slackNotificationIds = notifications.map(({id}) => id)
  const data = {userId: viewerId, slackNotificationIds}
  publish(SubscriptionChannel.TEAM, teamId, 'SetSlackNotificationPayload', data, subOptions)
  return data
}

export default setSlackNotification
