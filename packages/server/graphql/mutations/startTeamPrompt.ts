import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRule} from 'rrule'
import getRethink from '../../database/rethinkDriver'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import RedisLockQueue from '../../utils/RedisLockQueue'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import {startNewMeetingSeries} from '../public/mutations/updateRecurrenceSettings'
import {RRuleScalarType} from '../types/GraphQLRRuleType'
import StartTeamPromptPayload from '../types/StartTeamPromptPayload'
import isStartMeetingLocked from './helpers/isStartMeetingLocked'
import {IntegrationNotifier} from './helpers/notifications/IntegrationNotifier'
import safeCreateTeamPrompt from './helpers/safeCreateTeamPrompt'

const MEETING_START_DELAY_MS = 3000

const startTeamPrompt = {
  type: GraphQLNonNull(StartTeamPromptPayload),
  description: `Starts a new team prompt meeting`,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of the team starting the meeting'
    },
    recurrenceRule: {
      type: RRuleScalarType,
      description: 'The recurrence rule for the meeting series'
    }
  },
  resolve: async (
    _source: unknown,
    {teamId, recurrenceRule}: {teamId: string; recurrenceRule?: RRule},
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

    const meeting = await safeCreateTeamPrompt(teamId, viewerId, r, dataLoader)

    await Promise.all([
      r.table('NewMeeting').insert(meeting).run(),
      updateTeamByTeamId(
        {
          lastMeetingType: 'teamPrompt'
        },
        teamId
      )
    ])

    if (recurrenceRule) {
      const meetingSeries = await startNewMeetingSeries(
        viewerId,
        teamId,
        meeting.id,
        meeting.name,
        recurrenceRule
      )
      analytics.recurrenceStarted(viewerId, meetingSeries)
    }

    IntegrationNotifier.startMeeting(dataLoader, meeting.id, teamId)
    analytics.meetingStarted(viewerId, meeting)
    const data = {teamId, meetingId: meeting.id}
    publish(SubscriptionChannel.TEAM, teamId, 'StartTeamPromptSuccess', data, subOptions)
    return data
  }
}

export default startTeamPrompt
