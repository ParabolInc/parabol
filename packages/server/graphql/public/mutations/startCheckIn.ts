import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import ActionMeetingMember from '../../../database/types/ActionMeetingMember'
import MeetingAction from '../../../database/types/MeetingAction'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import createNewMeetingPhases from '../../mutations/helpers/createNewMeetingPhases'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import {MutationResolvers} from '../resolverTypes'

const startCheckIn: MutationResolvers['startCheckIn'] = async (
  _source,
  {teamId, name, gcalInput},
  context
) => {
  const r = await getRethink()
  const {authToken, socketId: mutatorId, dataLoader} = context
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  // AUTH
  const viewerId = getUserId(authToken)

  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  const unpaidError = await isStartMeetingLocked(teamId, dataLoader)
  if (unpaidError) return standardError(new Error(unpaidError), {userId: viewerId})

  const viewer = await dataLoader.get('users').loadNonNull(viewerId)

  const meetingType: MeetingTypeEnum = 'action'

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

  const meeting = new MeetingAction({
    id: meetingId,
    teamId,
    name: name ?? `Check-in #${meetingCount + 1}`,
    meetingCount,
    phases,
    facilitatorUserId: viewerId
  })
  await r.table('NewMeeting').insert(meeting).run()

  // Disallow 2 active check-in meetings
  const newActiveMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  const otherActiveMeeting = newActiveMeetings.find((activeMeeting) => {
    const {id} = activeMeeting
    if (id === meetingId || activeMeeting.meetingType !== meetingType) return false
    return true
  })
  if (otherActiveMeeting) {
    await r.table('NewMeeting').get(meetingId).delete().run()
    return {error: {message: 'Meeting already started'}}
  }
  const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
  const agendaItemIds = agendaItems.map(({id}) => id)

  const updates = {
    lastMeetingType: meetingType
  }
  await Promise.all([
    r
      .table('MeetingMember')
      .insert(new ActionMeetingMember({meetingId, userId: viewerId, teamId}))
      .run(),
    updateTeamByTeamId(updates, teamId),
    getKysely()
      .updateTable('AgendaItem')
      .set({meetingId})
      .where('id', 'in', agendaItemIds)
      .execute()
  ])
  IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
  analytics.meetingStarted(viewer, meeting)
  const {error} = await createGcalEvent({
    name: meeting.name,
    gcalInput,
    teamId,
    meetingId,
    viewerId,
    dataLoader
  })
  const data = {teamId, meetingId, hasGcalError: !!error?.message}
  publish(SubscriptionChannel.TEAM, teamId, 'StartCheckInSuccess', data, subOptions)
  return data
}

export default startCheckIn
