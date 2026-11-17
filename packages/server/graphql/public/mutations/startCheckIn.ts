import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import MeetingAction from '../../../database/types/MeetingAction'
import generateUID from '../../../generateUID'
import {meetingsStarted} from '../../../metricsHandler'
import getKysely from '../../../postgres/getKysely'
import type {CheckInMeeting, MeetingTypeEnum} from '../../../postgres/types/Meeting'
import type {CheckInPhase} from '../../../postgres/types/NewMeetingPhase'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import createNewMeetingPhases from '../../mutations/helpers/createNewMeetingPhases'
import insertNewMeeting from '../../mutations/helpers/insertNewMeeting'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import type {MutationResolvers} from '../resolverTypes'
import getNextFacilitatorUserId from './helpers/getNextFacilitatorUserId'
import setFacilitatorRotation from './helpers/setFacilitatorRotation'
import {createMeetingMember} from './joinMeeting'

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
  const meetingType: MeetingTypeEnum = 'action'
  const [unpaidError, meetingCount, {facilitatorUserId, rotation}, teamMember] = await Promise.all([
    isStartMeetingLocked(teamId, dataLoader),
    dataLoader.get('meetingCount').load({teamId, meetingType}),
    getNextFacilitatorUserId(teamId, viewerId, dataLoader),
    dataLoader.get('teamMembers').loadNonNull(toTeamMemberId(teamId, viewerId))
  ])
  if (unpaidError) throw new GraphQLError(unpaidError, {extensions: {code: 'FORBIDDEN'}})

  // RESOLUTION
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
    facilitatorUserId
  }) as CheckInMeeting
  try {
    await insertNewMeeting(meeting, inserts)
  } catch {
    throw new GraphQLError('Meeting already started', {extensions: {code: 'CONFLICT'}})
  }
  dataLoader.clearAll('newMeetings')
  const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
  const agendaItemIds = agendaItems.map(({id}) => id)
  const meetingMember = createMeetingMember(meeting, teamMember)
  await Promise.all([
    pg
      .with('TeamUpdates', (qb) =>
        qb.updateTable('Team').set({lastMeetingType: meetingType}).where('id', '=', teamId)
      )
      .insertInto('MeetingMember')
      .values(meetingMember)
      .execute(),
    agendaItemIds.length &&
      pg.updateTable('AgendaItem').set({meetingId}).where('id', 'in', agendaItemIds).execute(),
    rotation && setFacilitatorRotation(teamId, rotation, dataLoader)
  ])
  IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
  meetingsStarted.inc({meeting_type: meeting.meetingType})
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
