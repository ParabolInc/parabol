import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import MeetingTeamPrompt from '../../database/types/MeetingTeamPrompt'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import EndTeamPromptPayload from '../types/EndTeamPromptPayload'
import endTeamPromptHelper from './helpers/endTeamPrompt'

const endTeamPrompt = {
  type: GraphQLNonNull(EndTeamPromptPayload),
  description: `Finish the team prompt meeting`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting to end'
    }
  },
  resolve: async (_source: unknown, {meetingId}: {meetingId: string}, context: GQLContext) => {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const meeting = (await dataLoader
      .get('newMeetings')
      .load(meetingId)) as MeetingTeamPrompt | null
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {teamId} = meeting

    // VALIDATION
    if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    return endTeamPromptHelper({meeting, now, r, dataLoader, subOptions, viewerId})
  }
}

export default endTeamPrompt
