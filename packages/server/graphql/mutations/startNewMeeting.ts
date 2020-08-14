import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {
  IStartNewMeetingOnMutationArguments,
  MeetingTypeEnum as EMeetingTypeEnum
} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import GenericMeetingPhase from '../../database/types/GenericMeetingPhase'
import Meeting from '../../database/types/Meeting'
import MeetingAction from '../../database/types/MeetingAction'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import MeetingSettingsRetrospective from '../../database/types/MeetingSettingsRetrospective'
import Organization from '../../database/types/Organization'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import MeetingTypeEnum from '../types/MeetingTypeEnum'
import StartNewMeetingPayload from '../types/StartNewMeetingPayload'
import createMeetingMembers from './helpers/createMeetingMembers'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import {startSlackMeeting} from './helpers/notifySlack'

export default {
  type: new GraphQLNonNull(StartNewMeetingPayload),
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
  async resolve(
    _source,
    {teamId, meetingType}: IStartNewMeetingOnMutationArguments,
    {authToken, socketId: mutatorId, dataLoader}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const DUPLICATE_THRESHOLD = 2000
    // AUTH
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const meetingCount = await r
      .table('NewMeeting')
      .getAll(teamId, {index: 'teamId'})
      .filter({meetingType})
      .count()
      .default(0)
      .run()

    let phases: GenericMeetingPhase[]
    try {
      phases = await createNewMeetingPhases(teamId, meetingCount, meetingType, dataLoader)
    } catch (e) {
      console.log('e', e)
      return standardError(new Error('Could not start meeting'), {userId: viewerId})
    }
    const organization = (await r
      .table('Team')
      .get(teamId)('orgId')
      .do((orgId) => r.table('Organization').get(orgId))
      .run()) as Organization

    const {showConversionModal} = organization
    let meeting: Meeting
    if (meetingType === EMeetingTypeEnum.retrospective) {
      const meetingSettings = (await dataLoader
        .get('meetingSettingsByType')
        .load({teamId, meetingType})) as MeetingSettingsRetrospective
      const {totalVotes, maxVotesPerGroup, selectedTemplateId} = meetingSettings
      meeting = new MeetingRetrospective({
        teamId,
        meetingCount,
        phases,
        showConversionModal,
        facilitatorUserId: viewerId,
        totalVotes,
        maxVotesPerGroup,
        templateId: selectedTemplateId
      })
    } else {
      meeting = new MeetingAction({
        teamId,
        meetingCount,
        phases,
        facilitatorUserId: viewerId
      })
    }
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(meeting.teamId)
    const meetingMembers = createMeetingMembers(meeting, teamMembers)
    await r
      .table('NewMeeting')
      .insert(meeting)
      .run()

    // Disallow accidental starts (2 meetings within 2 seconds)
    const newActiveMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
    const otherActiveMeeting = newActiveMeetings.find((activeMeeting) => {
      const {createdAt, id} = activeMeeting
      if (id === meeting.id || activeMeeting.meetingType !== meetingType) return false
      return meetingType === EMeetingTypeEnum.action || createdAt > Date.now() - DUPLICATE_THRESHOLD
    })
    if (otherActiveMeeting) {
      await r
        .table('NewMeeting')
        .get(meeting.id)
        .delete()
        .run()
      return {error: {message: 'Meeting already started'}}
    }
    const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
    const agendaItemIds = agendaItems.map(({id}) => id)

    await Promise.all([
      r
        .table('MeetingMember')
        .insert(meetingMembers)
        .run(),
      r
        .table('Team')
        .get(teamId)
        .update({lastMeetingType: meetingType})
        .run(),
      r
        .table('AgendaItem')
        .getAll(r.args(agendaItemIds))
        .update({meetingId: meeting.id})
        .run()
    ])

    startSlackMeeting(meeting.id, teamId, dataLoader).catch(console.log)
    const data = {teamId, meetingId: meeting.id}
    publish(SubscriptionChannel.TEAM, teamId, 'StartNewMeetingPayload', data, subOptions)
    return data
  }
}
