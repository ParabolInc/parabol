import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import GenericMeetingPhase from 'server/database/types/GenericMeetingPhase'
import Meeting from 'server/database/types/Meeting'
import {GQLContext} from 'server/graphql/graphql'
import createMeetingMembers from 'server/graphql/mutations/helpers/createMeetingMembers'
import createNewMeetingPhases from 'server/graphql/mutations/helpers/createNewMeetingPhases'
import {startSlackMeeting} from 'server/graphql/mutations/helpers/notifySlack'
import MeetingTypeEnum from 'server/graphql/types/MeetingTypeEnum'
import StartNewMeetingPayload from 'server/graphql/types/StartNewMeetingPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import standardError from 'server/utils/standardError'
import {IStartNewMeetingOnMutationArguments, ITeamMember} from 'universal/types/graphql'
import {TEAM} from 'universal/utils/constants'

export default {
  type: StartNewMeetingPayload,
  description: 'Start a new meeting',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team starting the meeting'
    },
    meetingType: {
      type: new GraphQLNonNull(MeetingTypeEnum),
      description: 'The base type of the meeting (action, retro, etc)'
    }
  },
  async resolve (
    _source,
    {teamId, meetingType}: IStartNewMeetingOnMutationArguments,
    {authToken, socketId: mutatorId, dataLoader}: GQLContext
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
    const syncMeetingInProgress = activeMeetings.find((meeting) => !meeting.isAsync)
    if (syncMeetingInProgress) {
      return standardError(new Error('Meeting already started'), {userId: viewerId})
    }

    // RESOLUTION
    const meetingCount = (await r
      .table('NewMeeting')
      .getAll(teamId, {index: 'teamId'})
      .count()
      .default(0)) as number

    let phases: GenericMeetingPhase[]
    try {
      phases = await createNewMeetingPhases(teamId, meetingCount, meetingType, dataLoader)
    } catch (e) {
      return standardError(new Error('Could not start meeting'), {userId: viewerId})
    }
    const meeting = new Meeting(teamId, meetingType, meetingCount, phases, viewerId)
    const teamMembers = (await dataLoader
      .get('teamMembersByTeamId')
      .load(meeting.teamId)) as ITeamMember[]
    const meetingMembers = await createMeetingMembers(meeting, teamMembers, dataLoader)
    await r({
      team: r
        .table('Team')
        .get(teamId)
        .update({meetingId: meeting.id}),
      meeting: r.table('NewMeeting').insert(meeting),
      members: r.table('MeetingMember').insert(meetingMembers)
    })

    startSlackMeeting(teamId, meetingType)
    const data = {teamId, meetingId: meeting.id}
    publish(TEAM, teamId, StartNewMeetingPayload, data, subOptions)
    return data
  }
}
