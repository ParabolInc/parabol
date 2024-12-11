import {GraphQLID, GraphQLNonNull} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {AGENDA_ITEMS, LAST_CALL} from 'parabol-client/utils/constants'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {positionAfter} from '../../../client/shared/sortOrder'
import TimelineEventCheckinComplete from '../../database/types/TimelineEventCheckinComplete'
import {DataLoaderInstance} from '../../dataloader/RootDataLoader'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import {selectTasks} from '../../postgres/select'
import {AgendaItem, Task} from '../../postgres/types'
import {CheckInMeeting} from '../../postgres/types/Meeting'
import archiveTasksForDB from '../../safeMutations/archiveTasksForDB'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {Logger} from '../../utils/Logger'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import isValid from '../isValid'
import EndCheckInPayload from '../types/EndCheckInPayload'
import sendNewMeetingSummary from './helpers/endMeeting/sendNewMeetingSummary'
import gatherInsights from './helpers/gatherInsights'
import {IntegrationNotifier} from './helpers/notifications/IntegrationNotifier'
import removeEmptyTasks from './helpers/removeEmptyTasks'

type SortOrderTask = Pick<Task, 'id' | 'sortOrder'>
const updateTaskSortOrders = async (userIds: string[], tasks: SortOrderTask[]) => {
  const pg = getKysely()
  const taskMaxRes = await pg
    .selectFrom('Task')
    .select(({fn}) => fn.max<bigint>('sortOrder').as('maxSortOrder'))
    .where('userId', 'in', userIds)
    .where(sql<boolean>`'archived' != ALL(tags)`)
    .executeTakeFirst()
  const maxSortOrder = Number(taskMaxRes?.maxSortOrder ?? 0)

  // mutate what's in the dataloader
  tasks.forEach((task, idx) => {
    task.sortOrder = maxSortOrder + idx + 1
  })
  await Promise.all(
    tasks.map((task) =>
      pg.updateTable('Task').set({sortOrder: task.sortOrder}).where('id', '=', task.id).execute()
    )
  )
  return tasks
}

const clearAgendaItems = async (teamId: string, dataLoader: DataLoaderInstance) => {
  await getKysely()
    .updateTable('AgendaItem')
    .set({isActive: false})
    .where('teamId', '=', teamId)
    .execute()
  dataLoader.clearAll('agendaItems')
}

const getPinnedAgendaItems = async (teamId: string, dataLoader: DataLoaderInstance) => {
  const agendaItems = await dataLoader.get('agendaItemsByTeamId').load(teamId)
  return agendaItems.filter((agendaItem) => agendaItem.pinned)
}

const clonePinnedAgendaItems = async (
  pinnedAgendaItems: AgendaItem[],
  dataLoader: DataLoaderInstance
) => {
  if (!pinnedAgendaItems.length) return
  let curSortOrder = ''
  const clonedPins = pinnedAgendaItems.map((agendaItem) => {
    const agendaItemId = `${agendaItem.teamId}::${generateUID()}`
    const sortOrder = positionAfter(curSortOrder)
    curSortOrder = sortOrder
    return {
      id: agendaItemId,
      content: agendaItem.content,
      pinned: agendaItem.pinned,
      pinnedParentId: agendaItem.pinnedParentId ? agendaItem.pinnedParentId : agendaItemId,
      sortOrder,
      teamId: agendaItem.teamId,
      teamMemberId: agendaItem.teamMemberId
    }
  })
  await getKysely().insertInto('AgendaItem').values(clonedPins).execute()
  dataLoader.clearAll('agendaItems')
}

const summarizeCheckInMeeting = async (meeting: CheckInMeeting, dataLoader: DataLoaderWorker) => {
  /* If isKill, no agenda items were processed so clear none of them.
   * Similarly, don't clone pins. the original ones will show up again.
   */

  const {id: meetingId, teamId, phases} = meeting
  const pg = getKysely()
  const [meetingMembers, tasks, doneTasks, activeAgendaItems] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('tasksByMeetingId').load(meetingId),
    selectTasks()
      .where('teamId', '=', teamId)
      .where('status', '=', 'done')
      .where(sql<boolean>`'archived' != ALL(tags)`)
      .execute(),
    dataLoader.get('agendaItemsByTeamId').load(teamId)
  ])

  const agendaItemPhase = getPhase(phases, 'agendaitems')
  const {stages} = agendaItemPhase
  const discussionIds = stages.map((stage) => stage.discussionId)
  const userIds = meetingMembers.map(({userId}) => userId)
  const meetingPhase = getMeetingPhase(phases)
  const pinnedAgendaItems = await getPinnedAgendaItems(teamId, dataLoader)
  const isKill = !!(meetingPhase && ![AGENDA_ITEMS, LAST_CALL].includes(meetingPhase.phaseType))
  if (!isKill) await clearAgendaItems(teamId, dataLoader)
  const commentCounts = (
    await dataLoader.get('commentCountByDiscussionId').loadMany(discussionIds)
  ).filter(isValid)
  const commentCount = commentCounts.reduce((cumSum, count) => cumSum + count, 0)
  await Promise.all([
    isKill ? undefined : archiveTasksForDB(doneTasks, meetingId),
    isKill ? undefined : clonePinnedAgendaItems(pinnedAgendaItems, dataLoader),
    updateTaskSortOrders(userIds, tasks),
    pg
      .updateTable('NewMeeting')
      .set({
        agendaItemCount: activeAgendaItems.length,
        commentCount,
        taskCount: tasks.length
      })
      .where('id', '=', meetingId)
      .execute()
  ])
  dataLoader.clearAll('newMeetings')
  return {updatedTaskIds: [...tasks, ...doneTasks].map(({id}) => id)}
}

export default {
  type: new GraphQLNonNull(EndCheckInPayload),
  description: 'Finish a check-in meeting',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting to end'
    }
  },
  async resolve(_source: unknown, {meetingId}: {meetingId: string}, context: GQLContext) {
    const {authToken, socketId: mutatorId, dataLoader} = context
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    if (meeting.meetingType !== 'action') {
      return standardError(new Error('Not a check-in meeting'), {userId: viewerId})
    }
    const {endedAt, facilitatorStageId, phases, teamId} = meeting

    // VALIDATION
    if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

    // RESOLUTION
    const currentStageRes = findStageById(phases, facilitatorStageId)
    if (currentStageRes) {
      const {stage} = currentStageRes
      stage.isComplete = true
      stage.endAt = now
    }
    const phase = getMeetingPhase(phases)
    const insights = await gatherInsights(meeting, dataLoader)

    await pg
      .updateTable('NewMeeting')
      .set({
        endedAt: now,
        phases: JSON.stringify(phases),
        usedReactjis: JSON.stringify(insights.usedReactjis),
        engagement: insights.engagement
      })
      .where('id', '=', meetingId)
      .execute()
    dataLoader.clearAll('newMeetings')
    const completedCheckIn = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (completedCheckIn.meetingType !== 'action') {
      return standardError(new Error('Completed check-in meeting is not an action'), {
        userId: viewerId
      })
    }
    // remove any empty tasks
    const [meetingMembers, team, teamMembers, removedTaskIds] = await Promise.all([
      dataLoader.get('meetingMembersByMeetingId').load(meetingId),
      dataLoader.get('teams').loadNonNull(teamId),
      dataLoader.get('teamMembersByTeamId').load(teamId),
      removeEmptyTasks(meetingId)
    ])
    // need to wait for removeEmptyTasks before finishing the meeting
    const result = await summarizeCheckInMeeting(completedCheckIn, dataLoader)
    IntegrationNotifier.endMeeting(dataLoader, meetingId, teamId)
    const updatedTaskIds = (result && result.updatedTaskIds) || []

    analytics.checkInEnd(completedCheckIn, meetingMembers, dataLoader)
    sendNewMeetingSummary(completedCheckIn, context).catch(Logger.log)

    const events = teamMembers.map(
      (teamMember) =>
        new TimelineEventCheckinComplete({
          userId: teamMember.userId,
          teamId,
          orgId: team.orgId,
          meetingId
        })
    )
    await pg.insertInto('TimelineEvent').values(events).execute()
    if (team.isOnboardTeam) {
      const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
      const teamLeader = teamMembers.find(({isLead}) => isLead)!
      const {userId: teamLeadUserId} = teamLeader

      const removedSuggestedActionId = await removeSuggestedAction(
        teamLeadUserId,
        'tryActionMeeting'
      )
      if (removedSuggestedActionId) {
        publish(
          SubscriptionChannel.NOTIFICATION,
          teamLeadUserId,
          'EndCheckInSuccess',
          {removedSuggestedActionId},
          subOptions
        )
      }
    }

    const data = {
      meetingId,
      teamId,
      isKill: !!(phase && ![AGENDA_ITEMS, LAST_CALL].includes(phase.phaseType)),
      updatedTaskIds,
      removedTaskIds
    }
    publish(SubscriptionChannel.TEAM, teamId, 'EndCheckInSuccess', data, subOptions)

    return data
  }
}
