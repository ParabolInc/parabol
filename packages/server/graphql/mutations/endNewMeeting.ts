import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import shortid from 'shortid'
import {
  MeetingTypeEnum,
  NewMeetingPhaseTypeEnum,
  SuggestedActionTypeEnum
} from '../../../client/types/graphql'
import {
  ACTION,
  AGENDA_ITEMS,
  DISCUSS,
  DONE,
  LAST_CALL,
  RETROSPECTIVE
} from '../../../client/utils/constants'
import findStageById from '../../../client/utils/meetings/findStageById'
import getRethink from '../../database/rethinkDriver'
import GenericMeetingPhase from '../../database/types/GenericMeetingPhase'
import Meeting from '../../database/types/Meeting'
import MeetingAction from '../../database/types/MeetingAction'
import ReflectPhase from '../../database/types/ReflectPhase'
import Task from '../../database/types/Task'
import archiveTasksForDB from '../../safeMutations/archiveTasksForDB'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import sendSegmentEvent, {sendSegmentIdentify} from '../../utils/sendSegmentEvent'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import EndNewMeetingPayload from '../types/EndNewMeetingPayload'
import {COMPLETED_ACTION_MEETING, COMPLETED_RETRO_MEETING} from '../types/TimelineEventTypeEnum'
import sendNewMeetingSummary from './helpers/endMeeting/sendNewMeetingSummary'
import {endSlackMeeting} from './helpers/notifySlack'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'

const timelineEventLookup = {
  [RETROSPECTIVE]: COMPLETED_RETRO_MEETING,
  [ACTION]: COMPLETED_ACTION_MEETING
}

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
    .filter((task) =>
      task('tags')
        .contains('archived')
        .not()
    ) as any)
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

const shuffleCheckInOrder = async (teamId: string) => {
  const r = await getRethink()
  return r
    .table('TeamMember')
    .getAll(teamId, {index: 'teamId'})
    .sample(100000)
    .coerceTo('array')
    .do((arr) =>
      arr.forEach((doc) => {
        return r
          .table('TeamMember')
          .get(doc('id'))
          .update({
            checkInOrder: arr.offsetsOf(doc).nth(0)
          })
      })
    )
    .run()
}

const removeEmptyTasks = async (teamId: string, meetingId: string) => {
  const r = await getRethink()
  const createdTasks = await r
    .table('Task')
    .getAll(teamId, {index: 'teamId'})
    .filter({meetingId})
    .run()

  const removedTaskIds = createdTasks
    .map((task) => ({
      id: task.id,
      plaintextContent: extractTextFromDraftString(task.content)
    }))
    .filter(({plaintextContent}) => plaintextContent.length === 0)
    .map(({id}) => id)
  await r
    .table('Task')
    .getAll(r.args(removedTaskIds))
    .delete()
    .run()
  return removedTaskIds
}

const finishActionMeeting = async (meeting: MeetingAction, dataLoader: DataLoaderWorker) => {
  const {id: meetingId, teamId} = meeting
  const r = await getRethink()
  const [meetingMembers, tasks, doneTasks] = await Promise.all([
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
      .filter((task) =>
        task('tags')
          .contains('archived')
          .not()
      )
      .run()
  ])
  const userIds = meetingMembers.map(({userId}) => userId)
  await Promise.all([
    archiveTasksForDB(doneTasks, meetingId),
    updateTaskSortOrders(userIds, tasks),
    clearAgendaItems(teamId),
    r
      .table('NewMeeting')
      .get(meetingId)
      .update({taskCount: tasks.length})
      .run()
  ])
  return {updatedTaskIds: [...tasks, ...doneTasks].map(({id}) => id)}
}

const finishRetroMeting = async (meeting: MeetingRetrospective, dataLoader: DataLoaderWorker) => {
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
      return finishRetroMeting(meeting as MeetingRetrospective, dataLoader)
  }
  return undefined
}

const getIsKill = (meetingType: MeetingTypeEnum, phase: GenericMeetingPhase) => {
  switch (meetingType) {
    case MeetingTypeEnum.action:
      return ![AGENDA_ITEMS, LAST_CALL].includes(phase.phaseType)
    case MeetingTypeEnum.retrospective:
      return ![DISCUSS].includes(phase.phaseType)
  }
}

export default {
  type: new GraphQLNonNull(EndNewMeetingPayload),
  description: 'Finish a new meeting',
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
    // called by endOldMeetings, SU is OK
    if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

    // RESOLUTION
    const currentStageRes = findStageById(phases, facilitatorStageId)
    if (!currentStageRes) {
      return standardError(new Error('Cannot find facilitator stage'), {userId: viewerId})
    }
    const {stage, phase} = currentStageRes
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
      .run()) as unknown) as Meeting

    // remove any empty tasks
    const removedTaskIds = await removeEmptyTasks(teamId, meetingId)

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
    await shuffleCheckInOrder(teamId)
    const updatedTaskIds = (result && result.updatedTaskIds) || []
    const {facilitatorUserId} = completedMeeting
    const nonFacilitators = presentMemberUserIds.filter((userId) => userId !== facilitatorUserId)
    const traits = {
      wasFacilitator: false,
      teamMembersCount: meetingMembers.length,
      teamMembersPresentCount: presentMembers.length,
      teamId,
      meetingNumber
    }
    let meetingTemplateName
    if (meetingType === MeetingTypeEnum.retrospective) {
      const reflectPhase = phases.find(
        (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.reflect
      ) as ReflectPhase
      const {promptTemplateId} = reflectPhase
      const template = await dataLoader.get('reflectTemplates').load(promptTemplateId)
      meetingTemplateName = template.name
    }
    const segmentData = {...traits, meetingType, meetingTemplateName}
    const facilitatorSegmentData = {...segmentData, wasFacilitator: true}
    sendSegmentEvent('Meeting Completed', facilitatorUserId, facilitatorSegmentData).catch()
    sendSegmentEvent('Meeting Completed', nonFacilitators, segmentData).catch()
    sendSegmentIdentify(presentMemberUserIds).catch()
    sendNewMeetingSummary(completedMeeting, context).catch(console.log)

    const events = meetingMembers.map((meetingMember) => ({
      id: shortid.generate(),
      createdAt: now,
      interactionCount: 0,
      seenCount: 0,
      type: timelineEventLookup[meetingType],
      userId: meetingMember.userId,
      teamId,
      orgId: team.orgId,
      meetingId,
      isActive: true
    }))
    await r
      .table('TimelineEvent')
      .insert(events)
      .run()
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
      removedTaskIds
    }
    publish(SubscriptionChannel.TEAM, teamId, 'EndNewMeetingPayload', data, subOptions)
    return data
  }
}
