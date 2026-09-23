import ms from 'ms'
import {isAnonymousRespondentCount} from '../../../../client/shared/utils/teamHealthAnonymity'
import {isNotNull} from '../../../../client/utils/predicates'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {selectNewMeetings} from '../../../postgres/select'
import type {TeamHealthResponsePhase} from '../../../postgres/types/NewMeetingPhase'
import publishNotification from '../../public/mutations/helpers/publishNotification'
import getTeamHealthStragglers from './getTeamHealthStragglers'
import {IntegrationNotifier} from './notifications/IntegrationNotifier'

const REMINDER_LEAD = ms('24h')
const MIN_OPEN_BEFORE_REMINDER = ms('1h')

// A cycle is reminded once, when it is within REMINDER_LEAD of closing, provided it has been open
// long enough that the start notification is not still fresh. The reminder is a Notification row,
// so its existence is also the record that this cycle was already handled.
// Each cycle publishes under its own dataloader: the Slack DM lookup reprimes team rows, which
// would invalidate the snapshot a sibling cycle already published against
const remindTeamHealthResponders = async (mutatorId?: string) => {
  const now = Date.now()
  const pg = getKysely()
  const candidates = await selectNewMeetings()
    .where('meetingType', '=', 'teamHealth')
    .where('endedAt', 'is', null)
    .where('scheduledEndTime', '>', new Date(now))
    .where('scheduledEndTime', '<', new Date(now + REMINDER_LEAD))
    .where('createdAt', '<', new Date(now - MIN_OPEN_BEFORE_REMINDER))
    .where(({not, exists, selectFrom}) =>
      not(
        exists(
          selectFrom('Notification')
            .select('id')
            .whereRef('Notification.meetingId', '=', 'NewMeeting.id')
            .where('Notification.type', '=', 'TEAM_HEALTH_RESPONSE_DUE')
        )
      )
    )
    .execute()
  const meetings = candidates.filter((meeting) => meeting.meetingType === 'teamHealth')

  const remindMeeting = async (meeting: (typeof meetings)[number]) => {
    const {id: meetingId, teamId, phases} = meeting
    const responsePhase = phases.find(
      (phase): phase is TeamHealthResponsePhase => phase.phaseType === 'TEAM_HEALTH_RESPONSE'
    )
    if (!responsePhase) return false
    const questionIds = responsePhase.stages.map(({questionId}) => questionId)
    const dataLoader = getNewDataLoader('processRecurrence.remindTeamHealthResponders')
    const subOptions = {mutatorId, operationId: dataLoader.share()}
    try {
      const [teamMembers, meetingMembers, responses] = await Promise.all([
        dataLoader.get('teamMembersByTeamId').load(teamId),
        dataLoader.get('meetingMembersByMeetingId').load(meetingId),
        dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
      ])
      const users = await Promise.all(
        teamMembers.map(({userId}) => dataLoader.get('users').load(userId))
      )
      const inactiveUserIds = new Set(
        teamMembers.filter((_, idx) => users[idx]?.inactive !== false).map(({userId}) => userId)
      )
      const {eligibleUserIds, stragglerUserIds, respondentCount} = getTeamHealthStragglers({
        teamMembers,
        meetingMembers: meetingMembers.map((member) => ({
          userId: member.userId,
          isSpectating: 'isSpectating' in member ? member.isSpectating : false
        })),
        inactiveUserIds,
        responses,
        questionIds
      })
      if (stragglerUserIds.length === 0) return false

      const notifications = stragglerUserIds.map((userId) => ({
        id: generateUID(),
        type: 'TEAM_HEALTH_RESPONSE_DUE' as const,
        userId,
        meetingId
      }))
      await pg.insertInto('Notification').values(notifications).execute()
      notifications.forEach((notification) => {
        publishNotification(notification, subOptions)
        IntegrationNotifier.sendNotificationToUser?.(
          dataLoader,
          notification.id,
          notification.userId
        )
      })
      const userById = new Map(users.map((user, idx) => [teamMembers[idx]!.userId, user]))
      const stragglerNames = isAnonymousRespondentCount(respondentCount)
        ? stragglerUserIds.map((userId) => userById.get(userId)?.preferredName).filter(isNotNull)
        : []
      IntegrationNotifier.teamHealthResponseReminder(dataLoader, meetingId, teamId, {
        respondentCount,
        eligibleCount: eligibleUserIds.length,
        stragglerNames
      })
      return true
    } finally {
      dataLoader.dispose()
    }
  }

  const reminded = await Promise.all(meetings.map(remindMeeting))
  return reminded.filter(Boolean).length
}

export default remindTeamHealthResponders
