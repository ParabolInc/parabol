import {sql} from 'kysely'
import type AgendaItemsStage from '../../../database/types/AgendaItemsStage'
import type CheckInStage from '../../../database/types/CheckInStage'
import type EstimateStage from '../../../database/types/EstimateStage'
import type UpdatesStage from '../../../database/types/UpdatesStage'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {selectTasks} from '../../../postgres/select'
import archiveTasksForDB from '../../../safeMutations/archiveTasksForDB'
import {revalidateYjsConnections} from '../../../utils/tiptap/revalidateYjsConnections'
import errorFilter from '../../errorFilter'
import type {DataLoaderWorker} from '../../graphql'
import removeSlackAuths from './removeSlackAuths'
import removeStagesFromMeetings from './removeStagesFromMeetings'
import removeUserFromMeetingStages from './removeUserFromMeetingStages'
import {removeMeetingTOCAccess} from './summaryPage/removeMeetingTOCAccess'

interface Options {
  evictorUserId?: string
}

export const removeTeamMembers = async (
  teamId: string,
  userIds: string[],
  options: Options,
  dataLoader: DataLoaderWorker
) => {
  const {evictorUserId} = options
  const pg = getKysely()
  // Every successor (lead, task owner, page owner, facilitator) comes from the members who stay,
  // so the whole departing group leaves in one step. The row lock serializes removals from the
  // same team that arrive in separate requests
  const membership = await pg.transaction().execute(async (trx) => {
    await trx.selectFrom('Team').select('id').where('id', '=', teamId).forNoKeyUpdate().execute()
    const activeTeamMembers = await trx
      .selectFrom('TeamMember')
      .select(['id', 'userId', 'isLead'])
      .where('teamId', '=', teamId)
      .where('isNotRemoved', '=', true)
      .orderBy('createdAt')
      .execute()
    const departingMembers = activeTeamMembers.filter((member) => userIds.includes(member.userId))
    if (departingMembers.length === 0) return null
    const remainingMembers = activeTeamMembers.filter((member) => !userIds.includes(member.userId))
    const nextTeamLead = remainingMembers.find((member) => member.isLead) ?? remainingMembers[0]
    const departingTeamMemberIds = departingMembers.map(({id}) => id)

    if (!nextTeamLead) {
      await trx
        .with('TaskDelete', (qb) => qb.deleteFrom('Task').where('teamId', '=', teamId))
        .updateTable('Team')
        .set({isArchived: true})
        .where('id', '=', teamId)
        .execute()
    } else if (!nextTeamLead.isLead) {
      await trx
        .with('OldLead', (qb) =>
          qb
            .updateTable('TeamMember')
            .set({isLead: false})
            .where('id', 'in', departingTeamMemberIds)
            .where('isLead', '=', true)
        )
        .updateTable('TeamMember')
        .set({isLead: true})
        .where('id', '=', nextTeamLead.id)
        .execute()
    }

    await trx
      .updateTable('TeamMember')
      .set({isNotRemoved: false})
      .where('id', 'in', departingTeamMemberIds)
      .execute()
    return {departingMembers, nextTeamLead}
  })
  if (!membership) {
    return {
      removedUserIds: [] as string[],
      notificationIds: [] as string[],
      archivedTaskIds: [] as string[],
      reassignedTaskIds: [] as string[],
      activeMeetingIds: [] as string[]
    }
  }
  const {departingMembers, nextTeamLead} = membership
  const departingUserIds = departingMembers.map(({userId}) => userId)
  const departingTeamMemberIds = departingMembers.map(({id}) => id)
  dataLoader.clearAll('teamMembers')

  if (nextTeamLead) {
    for (const userId of departingUserIds) {
      await removeMeetingTOCAccess(teamId, userId, nextTeamLead.userId)
    }
  }
  await revalidateYjsConnections({userIds: departingUserIds})
  const integratedTasksToArchive = await selectTasks()
    .where('userId', 'in', departingUserIds)
    .where('teamId', '=', teamId)
    .where('integration', 'is not', null)
    .where(sql<boolean>`'archived' != ALL(tags)`)
    .execute()
  const reassignedTasks = nextTeamLead
    ? await pg
        .updateTable('Task')
        .set({userId: nextTeamLead.userId})
        .where('userId', 'in', departingUserIds)
        .where('teamId', '=', teamId)
        .where('integration', 'is', null)
        .where(sql<boolean>`'archived' != ALL(tags)`)
        .returning('id')
        .execute()
    : []
  dataLoader.clearAll(['users', 'tasks'])

  const notifications = evictorUserId
    ? departingUserIds.map((userId) => ({
        id: generateUID(),
        type: 'KICKED_OUT' as const,
        teamId,
        userId,
        evictorUserId
      }))
    : []
  if (notifications.length > 0) {
    await pg.insertInto('Notification').values(notifications).execute()
  }

  const archivedTaskIds = await archiveTasksForDB(integratedTasksToArchive)
  const teamAgendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
  const agendaItemIds = teamAgendaItems
    .filter((agendaItem) => departingTeamMemberIds.includes(agendaItem.teamMemberId))
    .map(({id}) => id)
  dataLoader.clearAll('agendaItems')
  // if a new meeting was currently running, remove them from it
  const filterFn = (stage: CheckInStage | UpdatesStage | EstimateStage | AgendaItemsStage) =>
    departingTeamMemberIds.includes((stage as CheckInStage | UpdatesStage).teamMemberId) ||
    agendaItemIds.includes((stage as AgendaItemsStage).agendaItemId)
  await Promise.all(departingUserIds.map((userId) => removeSlackAuths(userId, teamId)))
  await removeStagesFromMeetings(filterFn, teamId, dataLoader)
  for (const userId of departingUserIds) {
    await removeUserFromMeetingStages(userId, teamId, dataLoader)
  }
  // TODO should probably just inactivate the meeting member
  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  const meetingIds = activeMeetings.map(({id}) => id)

  // Reassign facilitator for meetings a departing member is facilitating.
  if (meetingIds.length > 0) {
    const facilitatingMeetings = await pg
      .with('DeleteMeetingMembers', (qb) =>
        qb
          .deleteFrom('MeetingMember')
          .where('userId', 'in', departingUserIds)
          .where('meetingId', 'in', meetingIds)
      )
      .selectFrom('NewMeeting')
      .select('id')
      .where('id', 'in', meetingIds)
      .where('facilitatorUserId', 'in', departingUserIds)
      .execute()
    dataLoader.clearAll('meetingMembers')

    const newMeetingFacilitators = (
      await dataLoader
        .get('meetingMembersByMeetingId')
        .loadMany(facilitatingMeetings.map((meeting) => meeting.id))
    )
      .filter(errorFilter)
      .map((members) => members[0])
      .filter((member) => !!member)

    await Promise.allSettled(
      newMeetingFacilitators.map(async (newFacilitator) => {
        await pg
          .updateTable('NewMeeting')
          .set({facilitatorUserId: newFacilitator.userId})
          .where('id', '=', newFacilitator.meetingId)
          .execute()
      })
    )
  }
  return {
    removedUserIds: departingUserIds,
    notificationIds: notifications.map(({id}) => id),
    archivedTaskIds,
    reassignedTaskIds: reassignedTasks.map(({id}) => id),
    activeMeetingIds: meetingIds
  }
}

export default removeTeamMembers
