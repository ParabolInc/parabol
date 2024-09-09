import ms from 'ms'
import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import {Logger} from '../../../utils/Logger'
import SlackServerManager from '../../../utils/SlackServerManager'
import {upsertNotifications} from '../../public/mutations/addSlackAuth'

const activatePrevSlackAuth = async (
  userId: string,
  teamId: string,
  dataLoader: DataLoaderInstance
) => {
  const previousAuths = await dataLoader.get('slackAuthByUserId').load(userId)
  const previousAuth = previousAuths.find((auth) => auth.teamId === teamId)
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
      Logger.error(authRes.error)
      return
    }

    await getKysely()
      .updateTable('SlackAuth')
      .set({isActive: true})
      .where('id', '=', authId)
      .execute()
    dataLoader.clearAll('slackAuths')
    await upsertNotifications(userId, teamId, defaultTeamChannelId, slackUserId)
  }
}

export default activatePrevSlackAuth
