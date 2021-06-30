import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {MeetingTypeEnum} from '../../database/types/Meeting'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import MeetingSettingsRetrospective from '../../database/types/MeetingSettingsRetrospective'
import Organization from '../../database/types/Organization'
import RetroMeetingMember from '../../database/types/RetroMeetingMember'
import generateUID from '../../generateUID'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import StartRetrospectivePayload from '../types/StartRetrospectivePayload'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import {startSlackMeeting} from './helpers/notifySlack'
import sendMeetingStartToSegment from './helpers/sendMeetingStartToSegment'

export default {
  type: new GraphQLNonNull(StartRetrospectivePayload),
  description: 'Start a new meeting',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team starting the meeting'
    }
  },
  async resolve(
    _source,
    {teamId}: {teamId: string},
    {authToken, socketId: mutatorId, dataLoader}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const DUPLICATE_THRESHOLD = 3000
    // AUTH
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    const meetingType: MeetingTypeEnum = 'retrospective'

    // RESOLUTION
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
    const organization = (await r
      .table('Team')
      .get(teamId)('orgId')
      .do((orgId) => r.table('Organization').get(orgId))
      .run()) as Organization
    const {showConversionModal} = organization

    const meetingSettings = (await dataLoader
      .get('meetingSettingsByType')
      .load({teamId, meetingType})) as MeetingSettingsRetrospective
    const {totalVotes, maxVotesPerGroup, selectedTemplateId} = meetingSettings
    const meeting = new MeetingRetrospective({
      id: meetingId,
      teamId,
      meetingCount,
      phases,
      showConversionModal,
      facilitatorUserId: viewerId,
      totalVotes,
      maxVotesPerGroup,
      templateId: selectedTemplateId
    })

    const template = await dataLoader.get('meetingTemplates').load(selectedTemplateId)
    await r
      .table('NewMeeting')
      .insert(meeting)
      .run()

    // Disallow accidental starts (2 meetings within 2 seconds)
    const newActiveMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
    const otherActiveMeeting = newActiveMeetings.find((activeMeeting) => {
      const {createdAt, id} = activeMeeting
      if (id === meetingId || activeMeeting.meetingType !== meetingType) return false
      return createdAt.getTime() > Date.now() - DUPLICATE_THRESHOLD
    })
    if (otherActiveMeeting) {
      await r
        .table('NewMeeting')
        .get(meetingId)
        .delete()
        .run()
      return {error: {message: 'Meeting already started'}}
    }

    const updates = {
      lastMeetingType: meetingType,
      updatedAt: new Date()
    }
    await Promise.all([
      r
        .table('MeetingMember')
        .insert(
          new RetroMeetingMember({meetingId, userId: viewerId, teamId, votesRemaining: totalVotes})
        )
        .run(),
      r
        .table('Team')
        .get(teamId)
        .update(updates)
        .run(),
      updateTeamByTeamId(updates, teamId)
    ])

    startSlackMeeting(meetingId, teamId, dataLoader).catch(console.log)
    sendMeetingStartToSegment(meeting, template)
    const data = {teamId, meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'StartRetrospectiveSuccess', data, subOptions)
    return data
  }
}
