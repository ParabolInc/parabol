import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {AGENDA_ITEMS, DONE, LAST_CALL} from 'parabol-client/utils/constants'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {checkTeamsLimit} from '../../billing/helpers/teamLimitsCheck'
import getRethink from '../../database/rethinkDriver'
import {RDatum} from '../../database/stricterR'
import AgendaItem from '../../database/types/AgendaItem'
import MeetingAction from '../../database/types/MeetingAction'
import Task from '../../database/types/Task'
import TimelineEventCheckinComplete from '../../database/types/TimelineEventCheckinComplete'
import generateUID from '../../generateUID'
import archiveTasksForDB from '../../safeMutations/archiveTasksForDB'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import EndCheckInPayload from '../types/EndCheckInPayload'
import sendNewMeetingSummary from './helpers/endMeeting/sendNewMeetingSummary'
import {IntegrationNotifier} from './helpers/notifications/IntegrationNotifier'
import removeEmptyTasks from './helpers/removeEmptyTasks'

type SortOrderTask = Pick<Task, 'id' | 'sortOrder'>
const updateTaskSortOrders = async (userIds: string[], tasks: SortOrderTask[]) => {
  const r = await getRethink()
  const taskMax = await (
    r
      .table('Task')
      .getAll(r.args(userIds), {index: 'userId'})
      .filter((task: RDatum) => task('tags').contains('archived').not()) as any
  )
    .max('sortOrder')('sortOrder')
    .default(0)
    .run()
  // mutate what's in the dataloader
  tasks.forEach((task, idx) => {
    task.sortOrder = taskMax + idx + 1
  })
  const updatedTasks = tasks.map((task) => ({
    id: task.id,
    sortOrder: task.sortOrder
  }))
  await r(updatedTasks)
    .forEach((task) => {
      return r
        .table('Task')
        .get(task('id'))
        .update({
          sortOrder: task('sortOrder') as unknown as number
        })
    })
    .run()
  return tasks
}

const clearAgendaItems = async (teamId: string) => {
  const r = await getRethink()
  return r
    .table('AgendaItem')
    .getAll(teamId, {index: 'teamId'})
    .update({
      isActive: false
    })
    .run()
}

const getPinnedAgendaItems = async (teamId: string) => {
  const r = await getRethink()
  return r
    .table('AgendaItem')
    .getAll(teamId, {index: 'teamId'})
    .filter({isActive: true, pinned: true})
    .run()
}

const clonePinnedAgendaItems = async (pinnedAgendaItems: AgendaItem[]) => {
  const r = await getRethink()
  const clonedPins = pinnedAgendaItems.map((agendaItem) => {
    const agendaItemId = `${agendaItem.teamId}::${generateUID()}`
    return new AgendaItem({
      id: agendaItemId,
      content: agendaItem.content,
      pinned: agendaItem.pinned,
      pinnedParentId: agendaItem.pinnedParentId ? agendaItem.pinnedParentId : agendaItemId,
      sortOrder: agendaItem.sortOrder,
      teamId: agendaItem.teamId,
      teamMemberId: agendaItem.teamMemberId
    })
  })
  await r.table('AgendaItem').insert(clonedPins).run()
}

const finishCheckInMeeting = async (meeting: MeetingAction, dataLoader: DataLoaderWorker) => {
  /* If isKill, no agenda items were processed so clear none of them.
   * Similarly, don't clone pins. the original ones will show up again.
   */

  const {id: meetingId, teamId, phases} = meeting
  const r = await getRethink()
  const [meetingMembers, tasks, doneTasks, activeAgendaItems] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    r
      .table('Task')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        meetingId
      })
      .run(),
    r
      .table('Task')
      .getAll(teamId, {index: 'teamId'})
      .filter({status: DONE})
      .filter((task: RDatum) => task('tags').contains('archived').not())
      .run(),
    r.table('AgendaItem').getAll(teamId, {index: 'teamId'}).filter({isActive: true}).run()
  ])

  const agendaItemPhase = getPhase(phases, 'agendaitems')
  const {stages} = agendaItemPhase
  const discussionIds = stages.map((stage) => stage.discussionId)
  const userIds = meetingMembers.map(({userId}) => userId)
  const meetingPhase = getMeetingPhase(phases)
  const pinnedAgendaItems = await getPinnedAgendaItems(teamId)
  const isKill = !!(meetingPhase && ![AGENDA_ITEMS, LAST_CALL].includes(meetingPhase.phaseType))
  if (!isKill) await clearAgendaItems(teamId)
  await Promise.all([
    isKill ? undefined : archiveTasksForDB(doneTasks, meetingId),
    isKill ? undefined : clonePinnedAgendaItems(pinnedAgendaItems),
    updateTaskSortOrders(userIds, tasks),
    r
      .table('NewMeeting')
      .get(meetingId)
      .update(
        {
          agendaItemCount: activeAgendaItems.length,
          commentCount: r
            .table('Comment')
            .getAll(r.args(discussionIds), {index: 'discussionId'})
            .count()
            .default(0) as unknown as number,
          taskCount: tasks.length
        },
        {nonAtomic: true}
      )
      .run()
  ])

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
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    const viewerId = getUserId(authToken)

    // AUTH
    const meeting = (await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
      .run()) as MeetingAction | null
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
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

    const completedCheckIn = (await r
      .table('NewMeeting')
      .get(meetingId)
      .update(
        {
          endedAt: now,
          phases
        },
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null)
      .run()) as unknown as MeetingAction

    if (!completedCheckIn) {
      return standardError(new Error('Completed check-in meeting does not exist'), {
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
    const result = await finishCheckInMeeting(completedCheckIn, dataLoader)
    IntegrationNotifier.endMeeting(dataLoader, meetingId, teamId)
    const updatedTaskIds = (result && result.updatedTaskIds) || []
    analytics.checkInEnd(completedCheckIn, meetingMembers)
    sendNewMeetingSummary(completedCheckIn, context).catch(console.log)
    checkTeamsLimit(team.orgId, dataLoader)
    const events = teamMembers.map(
      (teamMember) =>
        new TimelineEventCheckinComplete({
          userId: teamMember.userId,
          teamId,
          orgId: team.orgId,
          meetingId
        })
    )
    const timelineEventId = events[0]!.id
    await r.table('TimelineEvent').insert(events).run()
    if (team.isOnboardTeam) {
      const teamLeadUserId = await r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isLead: true})
        .nth(0)('userId')
        .run()

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
      removedTaskIds,
      timelineEventId
    }
    publish(SubscriptionChannel.TEAM, teamId, 'EndCheckInSuccess', data, subOptions)

    return data
  }
}
