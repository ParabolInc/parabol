import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import StartTeamPromptPayload from '../types/StartTeamPromptPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import standardError from '../../utils/standardError'
import isStartMeetingLocked from './helpers/isStartMeetingLocked'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import generateUID from '../../generateUID'
import MeetingTeamPrompt from '../../database/types/MeetingTeamPrompt'
import {startMattermostMeeting} from './helpers/notifications/notifyMattermost'
import {startSlackMeeting} from './helpers/notifications/notifySlack'
import sendMeetingStartToSegment from './helpers/sendMeetingStartToSegment'

const startTeamPrompt = {
  type: GraphQLNonNull(StartTeamPromptPayload),
  description: ``,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team starting the meeting'
    }
  },
  resolve: async (
    _source: unknown,
    {teamId}: {teamId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    const unpaidError = await isStartMeetingLocked(teamId, dataLoader)
    if (unpaidError) return standardError(new Error(unpaidError), {userId: viewerId})

    const meetingType: MeetingTypeEnum = 'teamPrompt'
    const meetingCount = await r
      .table('NewMeeting')
      .getAll(teamId, {index: 'teamId'})
      .filter({meetingType})
      .count()
      .default(0)
      .run()
    const meetingId = generateUID()
    const phases = await createNewMeetingPhases(
      viewerId,
      teamId,
      meetingId,
      meetingCount,
      meetingType,
      dataLoader
    )
    const meeting = new MeetingTeamPrompt({
      id: meetingId,
      teamId,
      meetingCount,
      phases,
      facilitatorUserId: viewerId
    })
    await r.table('NewMeeting').insert(meeting).run()

    startSlackMeeting(meetingId, teamId, dataLoader).catch(console.log)
    startMattermostMeeting(meetingId, teamId, dataLoader).catch(console.log)
    sendMeetingStartToSegment(meeting)
    const data = {teamId, meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'StartTeamPromptSuccess', data, subOptions)
    return data
  }
}

export default startTeamPrompt
