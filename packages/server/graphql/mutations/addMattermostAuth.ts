import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import upsertMattermostAuth from '../../postgres/queries/upsertMattermostAuth'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import GraphQLURLType from '../types/GraphQLURLType'
import AddMattermostAuthPayload from '../types/AddMattermostAuthPayload'
import {notifyWebhookConfigUpdated} from './helpers/notifications/notifyMattermost'

export default {
  name: 'AddSlackAuth',
  type: new GraphQLNonNull(AddMattermostAuthPayload),
  args: {
    webhookUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'the url of the Mattermost server the token is good for'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        "the teamId, when combined with the viewer's userId, used to upsert the credentials"
    }
  },
  resolve: async (
    _source,
    {webhookUrl, teamId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // VALIDATION
    const result = await notifyWebhookConfigUpdated(webhookUrl, viewerId, teamId, dataLoader)
    if (!result.ok) {
      return standardError(
        new Error(`Mattermost reports error (${result.status}): ${result.error}`),
        {userId: viewerId}
      )
    }

    // RESOLUTION
    await upsertMattermostAuth({
      webhookUrl,
      userId: viewerId,
      teamId
    })

    segmentIo.track({
      userId: viewerId,
      event: 'Added Integration',
      properties: {
        teamId,
        service: 'Mattermost'
      }
    })

    const data = {userId: viewerId, teamId}

    publish(SubscriptionChannel.TEAM, teamId, 'AddMattermostAuthPayload', data, subOptions)
    return data
  }
}
