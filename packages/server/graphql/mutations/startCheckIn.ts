import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import ActionMeetingMember from '../../database/types/ActionMeetingMember'
import MeetingAction from '../../database/types/MeetingAction'
import generateUID from '../../generateUID'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import StartCheckInPayload from '../types/StartCheckInPayload'
import createNewMeetingPhases from './helpers/createNewMeetingPhases'
import isStartMeetingLocked from './helpers/isStartMeetingLocked'
import {IntegrationNotifier} from './helpers/notifications/IntegrationNotifier'
import sendMeetingStartToSegment from './helpers/sendMeetingStartToSegment'

export default {
  type: new GraphQLNonNull(StartCheckInPayload),
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
    // AUTH
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    const unpaidError = await isStartMeetingLocked(teamId, dataLoader)
    if (unpaidError) return standardError(new Error(unpaidError), {userId: viewerId})

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
      phases,
      facilitatorUserId: viewerId
    })
    await r.table('NewMeeting').insert(meeting).run()

    // Disallow accidental starts (2 meetings within 2 seconds)
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
      lastMeetingType: meetingType,
      updatedAt: new Date()
    }
    await Promise.all([
      r
        .table('MeetingMember')
        .insert(new ActionMeetingMember({meetingId, userId: viewerId, teamId}))
        .run(),
      r.table('Team').get(teamId).update(updates).run(),
      updateTeamByTeamId(updates, teamId),
      r.table('AgendaItem').getAll(r.args(agendaItemIds)).update({meetingId}).run()
    ])

    IntegrationNotifier.startMeeting(dataLoader, meetingId, teamId)
    sendMeetingStartToSegment(meeting)
    const data = {teamId, meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'StartCheckInSuccess', data, subOptions)
    return data
  }
}
