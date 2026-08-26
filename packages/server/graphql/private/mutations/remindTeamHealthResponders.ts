import {sql} from 'kysely'
import ms from 'ms'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {selectNewMeetings} from '../../../postgres/select'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import publishNotification from '../../public/mutations/helpers/publishNotification'
import type {MutationResolvers} from '../resolverTypes'

// How close to closing a cycle has to be before its stragglers are nudged. A reminder is only
// useful while there is still time to act on it, and only persuasive while the deadline is real.
const REMINDER_LEAD = ms('24h')
// Don't nudge the moment a cycle opens. A short cycle would otherwise fire its reminder and its
// invitation together, which reads as a system that has already given up on you.
const MIN_OPEN_BEFORE_REMINDER = ms('1h')

const remindTeamHealthResponders: MutationResolvers['remindTeamHealthResponders'] = async (
  _source,
  _args,
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const now = Date.now()

  const openCycles = await selectNewMeetings()
    .where('meetingType', '=', 'teamHealth')
    .where('endedAt', 'is', null)
    .where('remindedAt', 'is', null)
    .where('scheduledEndTime', 'is not', null)
    .where('scheduledEndTime', '<', new Date(now + REMINDER_LEAD))
    .where('createdAt', '<', new Date(now - MIN_OPEN_BEFORE_REMINDER))
    .execute()

  let remindersSent = 0
  await Promise.allSettled(
    openCycles.map(async (meeting) => {
      const {id: meetingId, teamId} = meeting
      const [teamMembers, meetingMembers, responses] = await Promise.all([
        dataLoader.get('teamMembersByTeamId').load(teamId),
        dataLoader.get('meetingMembersByMeetingId').load(meetingId),
        dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
      ])
      const respondentIds = new Set(responses.map(({userId}) => userId))
      const spectatorIds = new Set(
        meetingMembers.filter(({isSpectating}) => isSpectating).map(({userId}) => userId)
      )
      const stragglerIds = teamMembers
        .map(({userId}) => userId)
        .filter((userId) => !respondentIds.has(userId) && !spectatorIds.has(userId))

      // claim the cycle before sending, so a slow send can't be re-entered by the next tick and
      // nudge the same people twice
      const claimed = await pg
        .updateTable('NewMeeting')
        .set({remindedAt: sql`CURRENT_TIMESTAMP`})
        .where('id', '=', meetingId)
        .where('remindedAt', 'is', null)
        .executeTakeFirst()
      if (!claimed.numUpdatedRows) return
      if (stragglerIds.length === 0) return

      const notifications = stragglerIds.map((userId) => ({
        id: generateUID(),
        type: 'TEAM_HEALTH_RESPONSE_REQUESTED' as const,
        userId,
        meetingId,
        teamId
      }))
      await pg.insertInto('Notification').values(notifications).execute()
      notifications.forEach((notification) => {
        IntegrationNotifier.sendNotificationToUser?.(
          dataLoader,
          notification.id,
          notification.userId
        )
        publishNotification(notification, subOptions)
      })
      remindersSent += notifications.length
    })
  )

  return {remindersSent}
}

export default remindTeamHealthResponders
