import {GraphQLError} from 'graphql'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const setSlackNotification: MutationResolvers['setSlackNotification'] = async (
  _source,
  {slackChannelId, slackNotificationEvents, teamId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  // VALIDATION
  const slackAuths = await dataLoader.get('slackAuthByUserId').load(viewerId)
  const slackAuth = slackAuths.find((auth) => auth.teamId === teamId)

  if (!slackAuth) {
    throw new GraphQLError('Slack authentication not found', {extensions: {code: 'NOT_FOUND'}})
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
  return {userId: viewerId, slackNotificationIds}
}

export default setSlackNotification
