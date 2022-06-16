import fromTeamMemberId from 'parabol-client/utils/relay/fromTeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import AgendaItemsStage from '../../../database/types/AgendaItemsStage'
import CheckInStage from '../../../database/types/CheckInStage'
import EstimateStage from '../../../database/types/EstimateStage'
import NotificationKickedOut from '../../../database/types/NotificationKickedOut'
import Task from '../../../database/types/Task'
import UpdatesStage from '../../../database/types/UpdatesStage'
import removeUserTms from '../../../postgres/queries/removeUserTms'
import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import archiveTasksForDB from '../../../safeMutations/archiveTasksForDB'
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
  const now = new Date()
  const {userId, teamId} = fromTeamMemberId(teamMemberId)
  // see if they were a leader, make a new guy leader so later we can reassign tasks
  const activeTeamMembers = await r.table('TeamMember').getAll(teamId, {index: 'teamId'}).run()
  const teamMember = activeTeamMembers.find((t) => t.id === teamMemberId)
  const {isLead, isNotRemoved} = teamMember ?? {}
  // if the guy being removed is the leader & not the last, pick a new one. else, use him
  const teamLeader = activeTeamMembers.find((t) => t.isLead === !isLead) || teamMember
  if (!isNotRemoved || !teamMember || !teamLeader) {
    throw new Error('Team member already removed')
  }

  if (activeTeamMembers.length === 1) {
    const updates = {
      isArchived: true,
      updatedAt: new Date()
    }
    await Promise.all([
      // archive single-person teams
      updateTeamByTeamId(updates, teamId),
      // delete all tasks belonging to a 1-person team
      r.table('Task').getAll(teamId, {index: 'teamId'}).delete()
    ])
  } else if (isLead) {
    // assign new leader, remove old leader flag
    await r({
      newTeamLead: r.table('TeamMember').get(teamLeader.id).update({
        isLead: true
      }),
      oldTeamLead: r.table('TeamMember').get(teamMemberId).update({isLead: false})
    }).run()
  }

  // assign active tasks to the team lead
  const {integratedTasksToArchive, reassignedTasks} = await r({
    teamMember: r.table('TeamMember').get(teamMemberId).update({
      isNotRemoved: false,
      updatedAt: now
    }),
    integratedTasksToArchive: r
      .table('Task')
      .getAll(userId, {index: 'userId'})
      .filter({teamId})
      .filter((task) => {
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
      .filter((task) =>
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

  await removeUserTms(teamId, userId)
  const user = await dataLoader.get('users').load(userId)

  let notificationId: string | undefined
  if (evictorUserId) {
    const notification = new NotificationKickedOut({teamId, userId, evictorUserId})
    notificationId = notification.id
    await r.table('Notification').insert(notification).run()
  }

  const archivedTasks = await archiveTasksForDB(integratedTasksToArchive)
  const archivedTaskIds = archivedTasks.map(({id}) => id)
  const agendaItemIds = await r
    .table('AgendaItem')
    .getAll(teamId, {index: 'teamId'})
    .filter((row) => row('teamMemberId').eq(teamMemberId))
    .getField('id')
    .run()

  // if a new meeting was currently running, remove them from it
  const filterFn = (stage: CheckInStage | UpdatesStage | EstimateStage | AgendaItemsStage) =>
    (stage as CheckInStage | UpdatesStage).teamMemberId === teamMemberId ||
    (stage as EstimateStage).creatorUserId === userId ||
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
  return {
    user,
    notificationId,
    archivedTaskIds,
    reassignedTaskIds: reassignedTasks.map(({id}) => id)
  }
}

export default removeTeamMember
