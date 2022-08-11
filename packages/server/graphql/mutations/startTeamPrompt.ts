import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import MeetingTeamPrompt from '../../database/types/MeetingTeamPrompt'
import generateUID from '../../generateUID'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import RedisLockQueue from '../../utils/RedisLockQueue'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import StartTeamPromptPayload from '../types/StartTeamPromptPayload'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import isStartMeetingLocked from './helpers/isStartMeetingLocked'
import {IntegrationNotifier} from './helpers/notifications/IntegrationNotifier'

const MEETING_START_DELAY_MS = 3000

const startTeamPrompt = {
  type: GraphQLNonNull(StartTeamPromptPayload),
  description: `Starts a new team prompt meeting`,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of the team starting the meeting'
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

    const redisLock = new RedisLockQueue(`newTeamPromptMeeting:${teamId}`, MEETING_START_DELAY_MS)
    try {
      await redisLock.lock(0)
    } catch (e) {
      return standardError(new Error('Meeting already started'), {
        userId: viewerId
      })
    }

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
      facilitatorUserId: viewerId,
      meetingPrompt: 'What are you working on today? Stuck on anything?' // :TODO: (jmtaber129): Get this from meeting settings.
    })
    await r.table('NewMeeting').insert(meeting).run()

    IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
    analytics.meetingStarted(viewerId, meeting)
    const data = {teamId, meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'StartTeamPromptSuccess', data, subOptions)
    return data
  }
}

export default startTeamPrompt
