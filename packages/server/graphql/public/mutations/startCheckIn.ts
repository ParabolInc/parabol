import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import ActionMeetingMember from '../../../database/types/ActionMeetingMember'
import MeetingAction from '../../../database/types/MeetingAction'
import generateUID from '../../../generateUID'
import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import createGcalEvent from '../../mutations/helpers/createGcalEvent'
import createNewMeetingPhases from '../../mutations/helpers/createNewMeetingPhases'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import maybeCreateOneOnOneTeam from '../../mutations/helpers/maybeCreateOneOnOneTeam'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import {MutationResolvers} from '../resolverTypes'

const startCheckIn: MutationResolvers['startCheckIn'] = async (
  _source,
  {teamId: existingTeamId, gcalInput, oneOnOneTeamInput},
  context
) => {
  const r = await getRethink()
  const {authToken, socketId: mutatorId, dataLoader} = context
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  // AUTH
  const viewerId = getUserId(authToken)

  if (existingTeamId && oneOnOneTeamInput) {
    return standardError(
      new Error('Please provide either "teamId" or "oneOnOneTeamInput", but not both'),
      {
        userId: viewerId
      }
    )
  }

  if (existingTeamId) {
    if (!isTeamMember(authToken, existingTeamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    const unpaidError = await isStartMeetingLocked(existingTeamId, dataLoader)
    if (unpaidError) return standardError(new Error(unpaidError), {userId: viewerId})
  }
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const teamId = oneOnOneTeamInput
    ? await maybeCreateOneOnOneTeam(viewer, oneOnOneTeamInput, context)
    : existingTeamId
  if (!teamId) {
    return standardError(new Error('Must provide teamId or oneOnOneTeamInput'), {
      userId: viewerId
    })
  }

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
    meetingCount,
    name: oneOnOneTeamInput ? `One on One #${meetingCount + 1}` : undefined,
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
    r.table('AgendaItem').getAll(r.args(agendaItemIds)).update({meetingId}).run()
  ])
  IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  analytics.meetingStarted(viewer, meeting, undefined, team)
  const {error} = await createGcalEvent({gcalInput, teamId, meetingId, viewerId, dataLoader})
  const data = {teamId, meetingId, hasGcalError: !!error?.message}
  publish(SubscriptionChannel.TEAM, teamId, 'StartCheckInSuccess', data, subOptions)
  return data
}

export default startCheckIn
