import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import updateMeetingTemplateLastUsedAt from '../../../postgres/queries/updateMeetingTemplateLastUsedAt'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import safeCreateTeamHealth from '../../mutations/helpers/safeCreateTeamHealth'
import type {MutationResolvers} from '../resolverTypes'
import {createMeetingMember} from './joinMeeting'

const startTeamHealth: MutationResolvers['startTeamHealth'] = async (
  _source,
  {teamIds, templateId},
  {authToken, socketId: mutatorId, dataLoader}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const meetingType = 'teamHealth' as const

  // AUTH
  const viewerId = getUserId(authToken)
  const uniqueTeamIds = [...new Set(teamIds)]
  if (uniqueTeamIds.length === 0) {
    throw new GraphQLError('No teams selected')
  }

  const [viewer, teams] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    dataLoader.get('teams').loadMany(uniqueTeamIds)
  ])

  // RESOLUTION
  const startedTeamIds: string[] = []
  const meetingIds: string[] = []
  for (const teamId of uniqueTeamIds) {
    const team = teams.find((t) => t && !(t instanceof Error) && t.id === teamId)
    if (!team || team instanceof Error) continue

    const unpaidError = await isStartMeetingLocked(teamId, dataLoader)
    if (unpaidError) continue

    const meeting = await safeCreateTeamHealth(
      {teamId, facilitatorUserId: viewerId, templateId},
      dataLoader
    )
    if (!meeting) continue

    const meetingId = meeting.id
    const meetingMember = createMeetingMember(meeting, {
      userId: viewerId,
      teamId,
      isSpectatingPoker: false
    })
    await Promise.all([
      pg
        .with('TeamUpdates', (qb) =>
          qb.updateTable('Team').set({lastMeetingType: meetingType}).where('id', '=', teamId)
        )
        .insertInto('MeetingMember')
        .values(meetingMember)
        .execute(),
      pg
        .updateTable('MeetingSettings')
        .set({selectedTemplateId: templateId})
        .where('teamId', '=', teamId)
        .where('meetingType', '=', meetingType)
        .execute(),
      updateMeetingTemplateLastUsedAt(templateId, teamId)
    ])
    dataLoader.get('newMeetings').clear(meetingId)
    dataLoader.get('activeMeetingsByTeamId').clear(teamId)

    IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
    analytics.meetingStarted(viewer, meeting)
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'StartTeamHealthSuccess',
      {meetingIds: [meetingId], teamIds: [teamId]},
      subOptions
    )

    startedTeamIds.push(teamId)
    meetingIds.push(meetingId)
  }

  if (meetingIds.length === 0) {
    throw new GraphQLError('Meeting already started')
  }

  return {meetingIds, teamIds: startedTeamIds}
}

export default startTeamHealth
