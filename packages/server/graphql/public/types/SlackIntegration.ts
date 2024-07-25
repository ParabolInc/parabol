import {getUserId} from '../../../utils/authorization'
import {SlackIntegrationResolvers} from '../resolverTypes'

const SlackIntegration: SlackIntegrationResolvers = {
  isActive: ({isActive, botAccessToken}) => !!(isActive && botAccessToken),

  botAccessToken: async ({botAccessToken, userId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return viewerId === userId ? botAccessToken : null
  },

  notifications: async ({userId, teamId}, _args, {dataLoader}) => {
    const slackNotifications = await dataLoader.get('slackNotificationsByTeamId').load(teamId)
    return slackNotifications.filter((notification) => notification.userId === userId)
  }
}

export default SlackIntegration
