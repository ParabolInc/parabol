import sendSegmentEvent, {sendSegmentIdentify} from 'server/utils/sendSegmentEvent'
import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {
  ACTION,
  AGENDA_ITEMS,
  DISCUSS,
  DONE,
  LAST_CALL,
  NOTIFICATION,
  RETROSPECTIVE,
  TEAM
} from 'universal/utils/constants'
import EndNewMeetingPayload from 'server/graphql/types/EndNewMeetingPayload'
import {endSlackMeeting} from 'server/graphql/mutations/helpers/notifySlack'
import sendNewMeetingSummary from 'server/graphql/mutations/helpers/endMeeting/sendNewMeetingSummary'
import shortid from 'shortid'
import {
  COMPLETED_ACTION_MEETING,
  COMPLETED_RETRO_MEETING
} from 'server/graphql/types/TimelineEventTypeEnum'
import removeSuggestedAction from 'server/safeMutations/removeSuggestedAction'
import standardError from 'server/utils/standardError'
import Meeting, {MeetingType} from 'server/database/types/Meeting'
import {DataLoaderWorker, GQLContext} from 'server/graphql/graphql'
import archiveTasksForDB from 'server/safeMutations/archiveTasksForDB'
import {ITask} from 'universal/types/graphql'
import findStageById from 'universal/utils/meetings/findStageById'
import GenericMeetingPhase from 'server/database/types/GenericMeetingPhase'

const timelineEventLookup = {
  [RETROSPECTIVE]: COMPLETED_RETRO_MEETING,
  [ACTION]: COMPLETED_ACTION_MEETING
}

const suggestedActionLookup = {
  [RETROSPECTIVE]: 'tryRetroMeeting',
  [ACTION]: 'tryActionMeeting'
}

type Task = Pick<ITask, 'id' | 'sortOrder'>
const updateTaskSortOrders = async (userIds: string[], tasks: Task[]) => {
  const r = getRethink()
  const taskMax = await r
    .table('Task')
    .getAll(r.args(userIds), {index: 'userId'})
    .filter((task) =>
      task('tags')
        .contains('archived')
        .not()
    )
    .max('sortOrder')('sortOrder')
    .default(0)
  // mutate what's in the dataloader
  tasks.forEach((task, idx) => {
    task.sortOrder = taskMax + idx + 1
  })
  const updatedTasks = tasks.map((task) => ({
    id: task.id,
    sortOrder: task.sortOrder
  }))
  await r(updatedTasks).forEach((task) => {
    return r
      .table('Task')
      .get(task('id'))
      .update({
        sortOrder: task('sortOrder')
      })
  })
  return tasks
}

const clearAgendaItems = async (teamId: string) => {
  const r = getRethink()
  return r
    .table('AgendaItem')
    .getAll(teamId, {index: 'teamId'})
    .update({
      isActive: false
    })
}

const shuffleCheckInOrder = async (teamId: string) => {
  const r = getRethink()
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
            checkInOrder: arr.offsetsOf(doc).nth(0),
            isCheckedIn: null
          })
      })
    )
}

const finishActionMeeting = async (meeting: Meeting, dataLoader: DataLoaderWorker) => {
  const {id: meetingId, teamId} = meeting
  const r = getRethink()
  const [meetingMembers, tasks, doneTasks] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    r
      .table('Task')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        meetingId
      }),
    r
      .table('Task')
      .getAll(teamId, {index: 'teamId'})
      .filter({status: DONE})
      .filter((task) =>
        task('tags')
          .contains('archived')
          .not()
      )
  ])
  const userIds = meetingMembers.map(({userId}) => userId)
  await Promise.all([
    archiveTasksForDB(doneTasks, meetingId),
    updateTaskSortOrders(userIds, tasks),
    clearAgendaItems(teamId),
    shuffleCheckInOrder(teamId),
    r
      .table('NewMeeting')
      .get(meetingId)
      .update({taskCount: tasks.length})
  ])
  return {updatedTaskIds: [...tasks, ...doneTasks].map(({id}) => id)}
}

const finishMeetingType = async (meeting: Meeting, dataLoader: DataLoaderWorker) => {
  if (meeting.meetingType === ACTION) return finishActionMeeting(meeting, dataLoader)
  return undefined
}

const getIsKill = (meetingType: MeetingType, phase: GenericMeetingPhase) => {
  switch (meetingType) {
    case 'action':
      return ![AGENDA_ITEMS, LAST_CALL].includes(phase.phaseType)
    case 'retrospective':
      return ![DISCUSS].includes(phase.phaseType)
  }
}

export default {
  type: EndNewMeetingPayload,
  description: 'Finish a new meeting',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting to end'
    }
  },
  async resolve (_source, {meetingId}, context: GQLContext) {
    const {authToken, socketId: mutatorId, dataLoader} = context
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    const viewerId = getUserId(authToken)
    // AUTH
    const meeting = (await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)) as Meeting | null
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, facilitatorStageId, meetingNumber, phases, teamId, meetingType} = meeting

    // VALIDATION
    // called by endOldMeetings, SU is OK
    if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    const team = await r.table('Team').get(teamId)
    if (!team.meetingId) {
      return standardError(new Error('Meeting already ended'), {userId: viewerId})
    }

    // RESOLUTION
    const currentStageRes = findStageById(phases, facilitatorStageId)
    if (!currentStageRes) {
      return standardError(new Error('Cannot find facilitator stage'), {userId: viewerId})
    }
    const {stage, phase} = currentStageRes
    stage.isComplete = true
    stage.endAt = now

    const {completedMeeting} = await r({
      team: r
        .table('Team')
        .get(teamId)
        .update({
          meetingId: null
        }),
      completedMeeting: r
        .table('NewMeeting')
        .get(meetingId)
        .update(
        {
          endedAt: now,
          phases
        },
          {returnChanges: true}
        )('changes')(0)('new_val')
    })

    const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
    const presentMembers = meetingMembers.filter(
      (meetingMember) => meetingMember.isCheckedIn === true
    )
    const presentMemberUserIds = presentMembers.map(({userId}) => userId)
    endSlackMeeting(meetingId, teamId, dataLoader).catch(console.log)

    const result = await finishMeetingType(completedMeeting, dataLoader)
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

    const eventName = `${meetingType} Meeting Completed`
    sendSegmentEvent(eventName, facilitatorUserId, {
      ...traits,
      wasFacilitator: true
    }).catch()
    sendSegmentEvent(eventName, nonFacilitators, traits).catch()
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
      meetingId
    }))
    await r.table('TimelineEvent').insert(events)
    if (team.isOnboardTeam) {
      const teamLeadUserId = await r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isLead: true})
        .nth(0)('userId')

      const removedSuggestedActionId = await removeSuggestedAction(
        teamLeadUserId,
        suggestedActionLookup[meetingType]
      )
      if (removedSuggestedActionId) {
        publish(
          NOTIFICATION,
          teamLeadUserId,
          EndNewMeetingPayload,
          {removedSuggestedActionId},
          subOptions
        )
      }
    }

    const data = {meetingId, teamId, isKill: getIsKill(meetingType, phase), updatedTaskIds}
    publish(TEAM, teamId, EndNewMeetingPayload, data, subOptions)
    return data
  }
}
