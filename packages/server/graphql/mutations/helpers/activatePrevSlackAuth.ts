import ms from 'ms'
import getRethink from '../../../database/rethinkDriver'
import SlackServerManager from '../../../utils/SlackServerManager'
import {upsertNotifications} from '../addSlackAuth'

const activatePrevSlackAuth = async (userId: string, teamId: string) => {
  const r = await getRethink()
  const now = new Date()
  const previousAuth = await r
    .table('SlackAuth')
    .getAll(userId, {index: 'userId'})
    .filter({teamId})
    .nth(0)
    .default(null)
    .run()

  if (!previousAuth) return
  const LAST_YEAR = new Date(Date.now() - ms('1y'))
  const {
    id: authId,
    botAccessToken,
    isActive,
    defaultTeamChannelId,
    slackUserId,
    updatedAt
  } = previousAuth
  // re-adding a Slack auth from a team they left 1y+ ago might feel creepy
  if (botAccessToken && !isActive && updatedAt > LAST_YEAR) {
    const manager = new SlackServerManager(botAccessToken)
    const authRes = await manager.isValidAuthToken(botAccessToken)
    if (!authRes.ok) {
      console.error(authRes.error)
      return
    }

    await r({
      auth: r.table('SlackAuth').get(authId).update({isActive: true, updatedAt: now}),
      notifications: upsertNotifications(userId, teamId, defaultTeamChannelId, slackUserId)
    }).run()
  }
}

export default activatePrevSlackAuth
