import getRethink from 'server/database/rethinkDriver'
import {DataLoaderWorker} from 'server/graphql/graphql'
import archiveTasksForDB from 'server/safeMutations/archiveTasksForDB'
import shortid from 'shortid'
import {KICKED_OUT} from 'universal/utils/constants'
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId'
import removeStagesFromNewMeeting from 'server/graphql/mutations/helpers/removeStagesFromNewMeeting'
import CheckInStage from 'server/database/types/CheckInStage'
import UpdatesStage from 'server/database/types/UpdatesStage'

interface Options {
  isKickout: boolean
}

const removeTeamMember = async (
  teamMemberId: string,
  options: Options,
  dataLoader: DataLoaderWorker
) => {
  const {isKickout} = options
  const r = getRethink()
  const now = new Date()
  const {userId, teamId} = fromTeamMemberId(teamMemberId)
  // see if they were a leader, make a new guy leader so later we can reassign tasks
  const activeTeamMembers = await r.table('TeamMember').getAll(teamId, {index: 'teamId'})
  const teamMember = activeTeamMembers.find((t) => t.id === teamMemberId)
  const {isLead, isNotRemoved} = teamMember
  // if the guy being removed is the leader & not the last, pick a new one. else, use him
  const teamLeader = activeTeamMembers.find((t) => t.isLead === !isLead) || teamMember
  if (!isNotRemoved) {
    throw new Error('Team member already removed')
  }

  if (activeTeamMembers.length === 1) {
    // archive single-person teams
    await r
      .table('Team')
      .get(teamId)
      .update({isArchived: true})
  } else if (isLead) {
    // assign new leader, remove old leader flag
    await r({
      newTeamLead: r
        .table('TeamMember')
        .get(teamLeader.id)
        .update({
          isLead: true
        }),
      oldTeamLead: r
        .table('TeamMember')
        .get(teamMemberId)
        .update({isLead: false})
    })
  }

  // assign active tasks to the team lead
  const {integratedTasksToArchive, reassignedTasks, removedNotifications, user} = await r({
    teamMember: r
      .table('TeamMember')
      .get(teamMemberId)
      .update({
        isNotRemoved: false,
        updatedAt: now
      }),
    integratedTasksToArchive: r
      .table('Task')
      .getAll(teamMemberId, {index: 'assigneeId'})
      .filter((task) => {
        return r.and(
          task('tags')
            .contains('archived')
            .not(),
          task('integrations')
            .default(null)
            .ne(null)
        )
      }),
    reassignedTasks: r
      .table('Task')
      .getAll(teamMemberId, {index: 'assigneeId'})
      .filter((task) =>
        r.and(
          task('tags')
            .contains('archived')
            .not(),
          task('integrations')
            .default(null)
            .eq(null)
        )
      )
      .update(
        {
          assigneeId: teamLeader.id,
          userId: teamLeader.userId
        },
        {returnChanges: true}
      )('changes')('new_val')
      .default([]),
    user: r
      .table('User')
      .get(userId)
      .update(
        (myUser) => ({
          tms: myUser('tms').difference([teamId])
        }),
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null),
    // not adjusting atlassian, if they join the team again, they'll be ready to go
    changedProviders: r
      .table('Provider')
      .getAll(teamId, {index: 'teamId'})
      .filter({userId, isActive: true})
      .update(
        {
          isActive: false
        },
        {returnChanges: true}
      )('changes')('new_val')
      .default([]),
    // note this may be too aggressive since 1 notification could have multiple userIds. we need to refactor to a single userId
    removedNotifications: r
      .table('Notification')
      .getAll(userId, {index: 'userIds'})
      .filter({teamId})
      .delete({returnChanges: true})('changes')('old_val')
      .default([])
  })

  let notificationId
  if (isKickout) {
    notificationId = shortid.generate()
    await r.table('Notification').insert({
      id: notificationId,
      startAt: now,
      teamId,
      type: KICKED_OUT,
      userIds: [userId]
    })
  }

  const archivedTasks = await archiveTasksForDB(integratedTasksToArchive)
  const archivedTaskIds = archivedTasks.map(({id}) => id)

  // if a new meeting was currently running, remove them from it
  const filterFn = (stage: CheckInStage | UpdatesStage) => {
    return stage.teamMemberId === teamMemberId
  }
  await removeStagesFromNewMeeting(filterFn, teamId, dataLoader)

  return {
    user,
    removedNotifications,
    notificationId,
    archivedTaskIds,
    reassignedTaskIds: reassignedTasks.map(({id}) => id)
  }
}

export default removeTeamMember
