import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import SlackServerManager from '../../../utils/SlackServerManager'
import standardError from '../../../utils/standardError'
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
    return standardError(new Error('Slack authentication not found'), {
      userId: viewerId
    })
  }
  const {id: slackAuthId, botAccessToken, defaultTeamChannelId, slackUserId} = slackAuth

  // should either be a public / private channel or the slackUserId if messaging from @Parabol
  if (slackChannelId !== slackUserId) {
    const manager = new SlackServerManager(botAccessToken!)
    const joinRes = await joinSlackChannel(manager, slackChannelId)
    if (!joinRes.ok) {
      return standardError(new Error(joinRes.error), {userId: viewerId})
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
