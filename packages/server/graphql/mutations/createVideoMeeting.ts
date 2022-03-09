import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import IntegrationProviderServiceEnum, {
  IntegrationProviderServiceEnumType
} from '../types/IntegrationProviderServiceEnum'
import CreateVideoMeetingPayload from '../types/CreateVideoMeetingPayload'
import ZoomServerManager from '../../integrations/zoom/ZoomServerManager'
import publish from '../../utils/publish'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

export default {
  type: CreateVideoMeetingPayload,
  args: {
    service: {
      type: new GraphQLNonNull(IntegrationProviderServiceEnum),
      description: 'Which integration to push the task to'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the task to convert to an issue'
    }
  },
  resolve: async (
    _source: unknown,
    {service, meetingId}: {service: IntegrationProviderServiceEnumType; meetingId: string},
    context: GQLContext
  ) => {
    const {authToken, dataLoader, socketId: mutatorId} = context

    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await r.table('NewMeeting').get(meetingId).run()
    if (!meeting) {
      return standardError(new Error('Meeting not found'), {userId: viewerId})
    }
    const {teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const auth = await dataLoader
      .get('teamMemberIntegrationAuths')
      .load({userId: viewerId, teamId, service})
    if (!auth) {
      return standardError(new Error('Not integrated'), {userId: viewerId})
    }

    const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)
    if (service !== 'zoom') {
      return {
        error: {
          message: 'Service not supported'
        }
      }
    }

    const manager = new ZoomServerManager(auth.accessToken!, provider.serverBaseUrl!)
    const res = await manager.createMeeting()

    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        videoMeetingUrl: res.join_url
      })
      .run()
    // update dataloader
    meeting.videoMeetingUrl = res.join_url

    const data = {
      meetingId
    }
    publish(SubscriptionChannel.MEETING, meetingId, 'CreateVideoMeetingSuccess', data, subOptions)

    return data
  }
}
