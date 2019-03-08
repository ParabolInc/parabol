import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import StartNewMeetingPayload from 'server/graphql/types/StartNewMeetingPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import shortid from 'shortid'
import {TEAM} from 'universal/utils/constants'
import MeetingTypeEnum from 'server/graphql/types/MeetingTypeEnum'
import extendNewMeetingForType from 'server/graphql/mutations/helpers/extendNewMeetingForType'
import createNewMeetingPhases from 'server/graphql/mutations/helpers/createNewMeetingPhases'
import {startSlackMeeting} from 'server/graphql/mutations/helpers/notifySlack'
import extendMeetingMembersForType from 'server/graphql/mutations/helpers/extendMeetingMembersForType'
import createMeetingMember from 'server/graphql/mutations/helpers/createMeetingMember'
import standardError from 'server/utils/standardError'

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
  async resolve(source, {teamId, meetingType}, {authToken, socketId: mutatorId, dataLoader}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {team, meetingCount} = await r({
      team: r.table('Team').get(teamId),
      meetingCount: r
        .table('NewMeeting')
        .getAll(teamId, {index: 'teamId'})
        .count()
        .default(0)
    })

    if (team.meetingId) {
      return standardError(new Error('Meeting already started'), {userId: viewerId})
    }

    // RESOLUTION
    const meetingId = shortid.generate()
    let phases
    try {
      phases = await createNewMeetingPhases(
        teamId,
        meetingId,
        meetingCount,
        meetingType,
        dataLoader
      )
    } catch (e) {
      return standardError(new Error('Could not start meeting'), {userId: viewerId})
    }
    const firstStage = phases[0] && phases[0].stages[0]
    const {id: facilitatorStageId} = firstStage
    const newMeetingBase = {
      id: meetingId,
      createdAt: now,
      updatedAt: now,
      facilitatorUserId: viewerId,
      facilitatorStageId,
      meetingNumber: meetingCount + 1,
      meetingType,
      phases,
      teamId
    }
    const newMeeting = extendNewMeetingForType(newMeetingBase)
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const createMemberForMeeting = createMeetingMember(meetingId, meetingType)
    const meetingMembersBase = teamMembers.map(createMemberForMeeting)
    const meetingMembers = await extendMeetingMembersForType(meetingMembersBase, dataLoader)
    await r({
      team: r
        .table('Team')
        .get(teamId)
        .update({meetingId}),
      meeting: r.table('NewMeeting').insert(newMeeting),
      members: r.table('MeetingMember').insert(meetingMembers)
    })

    startSlackMeeting(teamId, meetingType)
    const data = {teamId, meetingId}
    publish(TEAM, teamId, StartNewMeetingPayload, data, subOptions)
    return data
  }
}
