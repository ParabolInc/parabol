import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import EndTeamPromptPayload from '../types/EndTeamPromptPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import MeetingTeamPrompt from '../../database/types/MeetingTeamPrompt'
import standardError from '../../utils/standardError'

const endTeamPrompt = {
  type: GraphQLNonNull(EndTeamPromptPayload),
  description: `Finish the team prompt meeting`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting to end'
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId}: {meetingId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const meeting = (await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
      .run()) as MeetingTeamPrompt | null
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, teamId} = meeting

    // VALIDATION
    if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

    // RESOLUTION
    const completedTeamPrompt = (await r
      .table('NewMeeting')
      .get(meetingId)
      .update(
        {
          endedAt: now
        },
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null)
      .run()) as unknown as MeetingTeamPrompt

    if (!completedTeamPrompt) {
      return standardError(new Error('Completed team prompt meeting does not exist'), {
        userId: viewerId
      })
    }

    const data = {
      meetingId,
      teamId
    }
    publish(SubscriptionChannel.TEAM, teamId, 'EndTeamPromptSuccess', data, subOptions)
    return data
  }
}

export default endTeamPrompt
