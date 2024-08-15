import fromTeamMemberId from 'parabol-client/utils/relay/fromTeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import {RDatum} from '../../../database/stricterR'
import AgendaItemsStage from '../../../database/types/AgendaItemsStage'
import CheckInStage from '../../../database/types/CheckInStage'
import EstimateStage from '../../../database/types/EstimateStage'
import NotificationKickedOut from '../../../database/types/NotificationKickedOut'
import Task from '../../../database/types/Task'
import UpdatesStage from '../../../database/types/UpdatesStage'
import getKysely from '../../../postgres/getKysely'
import archiveTasksForDB from '../../../safeMutations/archiveTasksForDB'
import errorFilter from '../../errorFilter'
import {DataLoaderWorker} from '../../graphql'
import removeSlackAuths from './removeSlackAuths'
import removeStagesFromMeetings from './removeStagesFromMeetings'
import removeUserFromMeetingStages from './removeUserFromMeetingStages'

interface Options {
  evictorUserId?: string
}

const removeTeamMember = async (
  teamMemberId: string,
  options: Options,
  dataLoader: DataLoaderWorker
) => {
  const {evictorUserId} = options
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  const {userId, teamId} = fromTeamMemberId(teamMemberId)
  // see if they were a leader, make a new guy leader so later we can reassign tasks
  const activeTeamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const teamMember = activeTeamMembers.find((t) => t.id === teamMemberId)
  const {isLead, isNotRemoved} = teamMember ?? {}
  // if the guy being removed is the leader & not the last, pick a new one. else, use him
  const teamLeader = activeTeamMembers.find((t) => t.isLead === !isLead) || teamMember
  if (!isNotRemoved || !teamMember || !teamLeader) {
    throw new Error('Team member already removed')
  }

  if (activeTeamMembers.length === 1) {
    await Promise.all([
      // archive single-person teams
      pg.updateTable('Team').set({isArchived: true}).where('id', '=', teamId).execute(),
      // delete all tasks belonging to a 1-person team
      r.table('Task').getAll(teamId, {index: 'teamId'}).delete()
    ])
  } else if (isLead) {
    // assign new leader, remove old leader flag
    await pg
      .updateTable('TeamMember')
      .set(({not}) => ({isLead: not('isLead')}))
      .where('id', 'in', [teamMemberId, teamLeader.id])
      .execute()
  }

  await pg
    .updateTable('TeamMember')
    .set({isNotRemoved: false})
    .where('id', '=', teamMemberId)
    .execute()
  // assign active tasks to the team lead
  const {integratedTasksToArchive, reassignedTasks} = await r({
    integratedTasksToArchive: r
      .table('Task')
      .getAll(userId, {index: 'userId'})
      .filter({teamId})
      .filter((task: RDatum) => {
        return r.and(
          task('tags').contains('archived').not(),
          task('integrations').default(null).ne(null)
        )
      })
      .coerceTo('array') as unknown as Task[],
    reassignedTasks: r
      .table('Task')
      .getAll(userId, {index: 'userId'})
      .filter({teamId})
      .filter((task: RDatum) =>
        r.and(task('tags').contains('archived').not(), task('integrations').default(null).eq(null))
      )
      .update(
        {
          userId: teamLeader.userId
        },
        {returnChanges: true}
      )('changes')('new_val')
      .default([]) as unknown as Task[]
  }).run()
  await pg
    .updateTable('User')
    .set(({fn, ref, val}) => ({tms: fn('ARRAY_REMOVE', [ref('tms'), val(teamId)])}))
    .where('id', '=', userId)
    .execute()
  dataLoader.clearAll(['users', 'teamMembers'])
  const user = await dataLoader.get('users').load(userId)

  let notificationId: string | undefined
  if (evictorUserId) {
    const notification = new NotificationKickedOut({teamId, userId, evictorUserId})
    notificationId = notification.id
    await r.table('Notification').insert(notification).run()
  }

  const archivedTasks = await archiveTasksForDB(integratedTasksToArchive)
  const archivedTaskIds = archivedTasks.map(({id}) => id)
  const teamAgendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
  const agendaItemIds = teamAgendaItems
    .filter((agendaItem) => agendaItem.teamMemberId === teamMemberId)
    .map(({id}) => id)
  dataLoader.clearAll('agendaItems')
  // if a new meeting was currently running, remove them from it
  const filterFn = (stage: CheckInStage | UpdatesStage | EstimateStage | AgendaItemsStage) =>
    (stage as CheckInStage | UpdatesStage).teamMemberId === teamMemberId ||
    agendaItemIds.includes((stage as AgendaItemsStage).agendaItemId)
  removeSlackAuths(userId, teamId)
  await removeStagesFromMeetings(filterFn, teamId, dataLoader)
  await removeUserFromMeetingStages(userId, teamId, dataLoader)
  // TODO should probably just inactivate the meeting member
  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  const meetingIds = activeMeetings.map(({id}) => id)
  await r
    .table('MeetingMember')
    .getAll(r.args(meetingIds), {index: 'meetingId'})
    .filter({userId})
    .delete()
    .run()

  // Reassign facilitator for meetings this user is facilitating.
  const facilitatingMeetings = await r
    .table('NewMeeting')
    .getAll(r.args(meetingIds), {index: 'id'})
    .filter({
      facilitatorUserId: userId
    })
    .run()

  const newMeetingFacilitators = (
    await dataLoader
      .get('meetingMembersByMeetingId')
      .loadMany(facilitatingMeetings.map((meeting) => meeting.id))
  )
    .filter(errorFilter)
    .map((members) => members[0])
    .filter((member) => !!member)

  Promise.allSettled(
    newMeetingFacilitators.map(async (newFacilitator) => {
      if (!newFacilitator) {
        // This user is the only meeting member, so do nothing.
        // :TODO: (jmtaber129): Consider closing meetings where this user is the only meeting
        // member.
        return
      }
      await r
        .table('NewMeeting')
        .get(newFacilitator.meetingId)
        .update({
          facilitatorUserId: newFacilitator.userId,
          updatedAt: now
        })
        .run()
    })
  )

  return {
    user,
    notificationId,
    archivedTaskIds,
    reassignedTaskIds: reassignedTasks.map(({id}) => id)
  }
}

export default removeTeamMember
