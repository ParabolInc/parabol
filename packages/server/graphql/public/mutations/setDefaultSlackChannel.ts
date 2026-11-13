import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import SlackServerManager from '../../../utils/SlackServerManager'
import joinSlackChannel from '../../mutations/helpers/joinSlackChannel'
import type {MutationResolvers} from '../resolverTypes'

const setDefaultSlackChannel: MutationResolvers['setDefaultSlackChannel'] = async (
  _source,
  {slackChannelId, teamId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)

  // VALIDATION
  const slackAuths = await dataLoader.get('slackAuthByUserId').load(viewerId)
  const slackAuth = slackAuths.find((auth) => auth.teamId === teamId)
  if (!slackAuth) {
    throw new GraphQLError('Slack authentication not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {id: slackAuthId, botAccessToken, defaultTeamChannelId, slackUserId} = slackAuth

  // should either be a public / private channel or the slackUserId if messaging from @Parabol
  if (slackChannelId !== slackUserId) {
    const manager = new SlackServerManager(botAccessToken!)
    const joinRes = await joinSlackChannel(manager, slackChannelId)
    if (!joinRes.ok) {
      throw new GraphQLError(joinRes.error, {extensions: {code: 'SERVICE_UNAVAILABLE'}})
    }
  }

  // RESOLUTION
  if (slackChannelId !== defaultTeamChannelId) {
    await getKysely()
      .updateTable('SlackAuth')
      .set({
        defaultTeamChannelId: slackChannelId
      })
      .where('id', '=', slackAuthId)
      .execute()
  }
  const data = {slackChannelId, teamId, userId: viewerId}
  return data
}

export default setDefaultSlackChannel
