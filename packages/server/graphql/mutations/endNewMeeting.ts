import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {
  MeetingTypeEnum,
  NewMeetingPhaseTypeEnum,
  SuggestedActionTypeEnum
} from 'parabol-client/types/graphql'
import {
  ACTION,
  AGENDA_ITEMS,
  DISCUSS,
  DONE,
  LAST_CALL,
  RETROSPECTIVE
} from 'parabol-client/utils/constants'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import shortid from 'shortid'
import getRethink from '../../database/rethinkDriver'
import AgendaItem from '../../database/types/AgendaItem'
import GenericMeetingPhase from '../../database/types/GenericMeetingPhase'
import Meeting from '../../database/types/Meeting'
import MeetingAction from '../../database/types/MeetingAction'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import Task from '../../database/types/Task'
import TimelineEventCheckinComplete from '../../database/types/TimelineEventCheckinComplete'
import TimelineEventRetroComplete from '../../database/types/TimelineEventRetroComplete'
import archiveTasksForDB from '../../safeMutations/archiveTasksForDB'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import EndNewMeetingPayload from '../types/EndNewMeetingPayload'
import sendNewMeetingSummary from './helpers/endMeeting/sendNewMeetingSummary'
import {endSlackMeeting} from './helpers/notifySlack'
import removeEmptyTasks from './helpers/removeEmptyTasks'

const timelineEventLookup = {
  [RETROSPECTIVE]: TimelineEventRetroComplete,
  [ACTION]: TimelineEventCheckinComplete
} as const

const suggestedActionLookup = {
  [MeetingTypeEnum.retrospective]: SuggestedActionTypeEnum.tryRetroMeeting,
  [MeetingTypeEnum.action]: SuggestedActionTypeEnum.tryActionMeeting
} as const

type SortOrderTask = Pick<Task, 'id' | 'sortOrder'>
const updateTaskSortOrders = async (userIds: string[], tasks: SortOrderTask[]) => {
  const r = await getRethink()
  const taskMax = await (r
    .table('Task')
    .getAll(r.args(userIds), {index: 'userId'})
    .filter((task) => task('tags').contains('archived').not()) as any)
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
          sortOrder: (task('sortOrder') as unknown) as number
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
  const formattedPinnedAgendaItems = pinnedAgendaItems.map((agendaItem) => {
    const agendaItemId = `${agendaItem.teamId}::${shortid.generate()}`
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

  await r.table('AgendaItem').insert(formattedPinnedAgendaItems).run()
}

const finishActionMeeting = async (meeting: MeetingAction, dataLoader: DataLoaderWorker) => {
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
      .filter((task) => task('tags').contains('archived').not())
      .run(),
    r.table('AgendaItem').getAll(teamId, {index: 'teamId'}).filter({isActive: true}).run()
  ])

  const activeAgendaItemIds = activeAgendaItems.map(({id}) => id)
  const userIds = meetingMembers.map(({userId}) => userId)
  const meetingPhase = getMeetingPhase(phases)
  const pinnedAgendaItems = await getPinnedAgendaItems(teamId)
  const isKill = getIsKill(MeetingTypeEnum.action, meetingPhase)
  await Promise.all([
    isKill ? undefined : archiveTasksForDB(doneTasks, meetingId),
    isKill ? undefined : clearAgendaItems(teamId),
    isKill ? undefined : clonePinnedAgendaItems(pinnedAgendaItems),
    updateTaskSortOrders(userIds, tasks),
    r
      .table('NewMeeting')
      .get(meetingId)
      .update(
        {
          agendaItemCount: activeAgendaItems.length,
          commentCount: (r
            .table('Comment')
            .getAll(r.args(activeAgendaItemIds), {index: 'threadId'})
            .count()
            .default(0) as unknown) as number,
          taskCount: tasks.length
        },
        {nonAtomic: true}
      )
      .run()
  ])

  return {updatedTaskIds: [...tasks, ...doneTasks].map(({id}) => id)}
}

const finishRetroMeeting = async (meeting: MeetingRetrospective, dataLoader: DataLoaderWorker) => {
  const {id: meetingId} = meeting
  const r = await getRethink()
  const [reflectionGroups, reflections] = await Promise.all([
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  ])
  const reflectionGroupIds = reflectionGroups.map(({id}) => id)

  await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      {
        commentCount: (r
          .table('Comment')
          .getAll(r.args(reflectionGroupIds), {index: 'threadId'})
          .filter({isActive: true})
          .count()
          .default(0) as unknown) as number,
        taskCount: (r
          .table('Task')
          .getAll(r.args(reflectionGroupIds), {index: 'threadId'})
          .count()
          .default(0) as unknown) as number,
        topicCount: reflectionGroupIds.length,
        reflectionCount: reflections.length
      },
      {nonAtomic: true}
    )
    .run()
}

const finishMeetingType = async (
  meeting: MeetingRetrospective | MeetingAction,
  dataLoader: DataLoaderWorker
) => {
  switch (meeting.meetingType) {
    case MeetingTypeEnum.action:
      return finishActionMeeting(meeting, dataLoader)
    case MeetingTypeEnum.retrospective:
      return finishRetroMeeting(meeting as MeetingRetrospective, dataLoader)
  }
  return undefined
}

const getIsKill = (meetingType: MeetingTypeEnum, phase?: GenericMeetingPhase) => {
  if (!phase) return false
  switch (meetingType) {
    case MeetingTypeEnum.action:
      return ![AGENDA_ITEMS, LAST_CALL].includes(phase.phaseType)
    case MeetingTypeEnum.retrospective:
      return ![DISCUSS].includes(phase.phaseType)
    case MeetingTypeEnum.poker:
      return !['ESTIMATE'].includes(phase.phaseType)
  }
}

export default {
  type: new GraphQLNonNull(EndNewMeetingPayload),
  description: 'Finish a new meeting',
  deprecationReason: 'Using more specfic end[meetingType] instead',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting to end'
    }
  },
  async resolve(_source, {meetingId}, context: GQLContext) {
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
      .run()) as Meeting | null
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, facilitatorStageId, meetingNumber, phases, teamId, meetingType} = meeting

    // VALIDATION
    if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

    // RESOLUTION
    const currentStageRes = findStageById(phases, facilitatorStageId)
    if (!currentStageRes) {
      return standardError(new Error('Cannot find facilitator stage'), {userId: viewerId})
    }
    const {stage} = currentStageRes
    const phase = getMeetingPhase(phases)
    stage.isComplete = true
    stage.endAt = now

    const completedMeeting = ((await r
      .table('NewMeeting')
      .get(meetingId)
      .update(
        {
          endedAt: now,
          phases
        },
        {returnChanges: true}
      )('changes')(0)('new_val')
      .run()) as unknown) as MeetingRetrospective | MeetingAction

    // remove any empty tasks
    const removedTaskIds = await removeEmptyTasks(meetingId)

    const [meetingMembers, team] = await Promise.all([
      dataLoader.get('meetingMembersByMeetingId').load(meetingId),
      dataLoader.get('teams').load(teamId)
    ])
    const presentMembers = meetingMembers.filter(
      (meetingMember) => meetingMember.isCheckedIn === true
    )
    const presentMemberUserIds = presentMembers.map(({userId}) => userId)
    endSlackMeeting(meetingId, teamId, dataLoader).catch(console.log)

    const result = await finishMeetingType(completedMeeting, dataLoader)
    const updatedTaskIds = (result && result.updatedTaskIds) || []
    const {facilitatorUserId} = completedMeeting
    const templateId = (completedMeeting as MeetingRetrospective).templateId || undefined
    const template = templateId
      ? await dataLoader.get('meetingTemplates').load(templateId)
      : undefined
    const meetingTemplateName = template?.name
    presentMemberUserIds.forEach((userId) => {
      const wasFacilitator = userId === facilitatorUserId
      segmentIo.track({
        userId,
        event: 'Meeting Completed',
        properties: {
          hasIcebreaker: phases[0].phaseType === NewMeetingPhaseTypeEnum.checkin,
          // include wasFacilitator as a flag to handle 1 per meeting
          wasFacilitator,
          userIds: wasFacilitator ? presentMemberUserIds : undefined,
          meetingType,
          meetingTemplateName,
          meetingNumber,
          teamMembersCount: meetingMembers.length,
          teamMembersPresentCount: presentMembers.length,
          teamId
        }
      })
    })
    sendNewMeetingSummary(completedMeeting, context).catch(console.log)
    const TimelineEvent = timelineEventLookup[meetingType]
    const events = meetingMembers.map(
      (meetingMember) =>
        new TimelineEvent({
          userId: meetingMember.userId,
          teamId,
          orgId: team.orgId,
          meetingId
        })
    )
    const timelineEventId = events[0].id as string
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
        suggestedActionLookup[meetingType]
      )
      if (removedSuggestedActionId) {
        publish(
          SubscriptionChannel.NOTIFICATION,
          teamLeadUserId,
          'EndNewMeetingPayload',
          {removedSuggestedActionId},
          subOptions
        )
      }
    }

    const data = {
      meetingId,
      teamId,
      isKill: getIsKill(meetingType, phase),
      updatedTaskIds,
      removedTaskIds,
      timelineEventId
    }
    publish(SubscriptionChannel.TEAM, teamId, 'EndNewMeetingPayload', data, subOptions)

    return data
  }
}
