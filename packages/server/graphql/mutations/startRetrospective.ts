import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import MeetingSettingsRetrospective from '../../database/types/MeetingSettingsRetrospective'
import RetroMeetingMember from '../../database/types/RetroMeetingMember'
import generateUID from '../../generateUID'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import StartRetrospectivePayload from '../types/StartRetrospectivePayload'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import isStartMeetingLocked from './helpers/isStartMeetingLocked'
import {IntegrationNotifier} from './helpers/notifications/IntegrationNotifier'

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
    _source: unknown,
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
      return standardError(new Error('User not on team'), {userId: viewerId})
    }
    const unpaidError = await isStartMeetingLocked(teamId, dataLoader)
    if (unpaidError) return standardError(new Error(unpaidError), {userId: viewerId})

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
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const organization = await r.table('Organization').get(team.orgId).run()
    const {showConversionModal} = organization

    const meetingSettings = (await dataLoader
      .get('meetingSettingsByType')
      .load({teamId, meetingType})) as MeetingSettingsRetrospective
    const {totalVotes, maxVotesPerGroup, selectedTemplateId, disableAnonymity} = meetingSettings
    const meeting = new MeetingRetrospective({
      id: meetingId,
      teamId,
      meetingCount,
      phases,
      showConversionModal,
      facilitatorUserId: viewerId,
      totalVotes,
      maxVotesPerGroup,
      disableAnonymity,
      templateId: selectedTemplateId
    })

    const template = await dataLoader.get('meetingTemplates').load(selectedTemplateId)
    const now = new Date()
    await r({
      template: r.table('MeetingTemplate').get(selectedTemplateId).update({lastUsedAt: now}),
      meeting: r.table('NewMeeting').insert(meeting)
    }).run()

    // Disallow accidental starts (2 meetings within 2 seconds)
    const newActiveMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
    const otherActiveMeeting = newActiveMeetings.find((activeMeeting) => {
      const {createdAt, id} = activeMeeting
      if (id === meetingId || activeMeeting.meetingType !== meetingType) return false
      return createdAt.getTime() > Date.now() - DUPLICATE_THRESHOLD
    })
    if (otherActiveMeeting) {
      await r.table('NewMeeting').get(meetingId).delete().run()
      return {error: {message: 'Meeting already started'}}
    }

    const updates = {
      lastMeetingType: meetingType
    }
    await Promise.all([
      r
        .table('MeetingMember')
        .insert(
          new RetroMeetingMember({meetingId, userId: viewerId, teamId, votesRemaining: totalVotes})
        )
        .run(),
      updateTeamByTeamId(updates, teamId)
    ])

    IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
    analytics.meetingStarted(viewerId, meeting, template)
    const data = {teamId, meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'StartRetrospectiveSuccess', data, subOptions)
    return data
  }
}
