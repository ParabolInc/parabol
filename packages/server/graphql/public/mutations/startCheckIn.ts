import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingAction from '../../../database/types/MeetingAction'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {CheckInMeeting, MeetingTypeEnum} from '../../../postgres/types/Meeting'
import {CheckInPhase} from '../../../postgres/types/NewMeetingPhase'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import createNewMeetingPhases from '../../mutations/helpers/createNewMeetingPhases'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import {createMeetingMember} from '../../mutations/joinMeeting'
import {MutationResolvers} from '../resolverTypes'

const startCheckIn: MutationResolvers['startCheckIn'] = async (
  _source,
  {teamId, name, gcalInput},
  context
) => {
  const pg = getKysely()
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
  const meetingCount = await dataLoader.get('meetingCount').load({teamId, meetingType})
  const meetingId = generateUID()

  const [phases, inserts] = await createNewMeetingPhases<CheckInPhase>(
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
  }) as CheckInMeeting
  try {
    await pg.transaction().execute(async (pg) => {
      await pg
        .insertInto('NewMeeting')
        .values({...meeting, phases: JSON.stringify(phases)})
        .execute()
      await Promise.all(inserts.map((insert) => pg.executeQuery(insert)))
    })
  } catch (e) {
    return {error: {message: 'Meeting already started'}}
  }
  dataLoader.clearAll('newMeetings')
  const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
  const agendaItemIds = agendaItems.map(({id}) => id)
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
    agendaItemIds.length &&
      pg.updateTable('AgendaItem').set({meetingId}).where('id', 'in', agendaItemIds).execute()
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
