import {GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import getUsersToIgnore from './helpers/getUsersToIgnore'
import AreaEnum from '../types/AreaEnum'
import CreateTaskInput from '../types/CreateTaskInput'
import CreateTaskPayload from '../types/CreateTaskPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import shortid from 'shortid'
import getTypeFromEntityMap from '../../../client/utils/draftjs/getTypeFromEntityMap'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import standardError from '../../utils/standardError'
import Task from '../../database/types/Task'
import {
  ICreateTaskOnMutationArguments,
  ThreadSourceEnum,
  NewMeetingPhaseTypeEnum
} from '../../../client/types/graphql'
import {DataLoaderWorker, GQLContext} from '../graphql'
import normalizeRawDraftJS from '../../../client/validation/normalizeRawDraftJS'
import NotificationTaskInvolves from '../../database/types/NotificationTaskInvolves'
import {ITeamMember} from 'parabol-client/types/graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import validateThreadableReflectionGroupId from './validateThreadableReflectionGroupId'
import sendSegmentEvent from '../../utils/sendSegmentEvent'

const validateTaskAgendaItemId = async (
  threadSource: ThreadSourceEnum | null,
  threadId: string | null | undefined,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const agendaItemId = threadSource === ThreadSourceEnum.AGENDA_ITEM ? threadId : undefined
  if (agendaItemId) {
    const agendaItem = await dataLoader.get('agendaItems').load(agendaItemId)
    if (!agendaItem || agendaItem.teamId !== teamId) {
      return 'Invalid agenda item ID'
    }
  }
  return undefined
}

const validateTaskMeetingId = async (
  meetingId: string | null | undefined,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  if (meetingId) {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting || meeting.teamId !== teamId) {
      return 'Invalid meeting ID'
    }
  }
  return undefined
}

export const validateTaskUserId = async (
  userId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const teamMemberId = toTeamMemberId(teamId, userId)
  const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
  return teamMember ? undefined : 'Invalid user ID'
}

export default {
  type: GraphQLNonNull(CreateTaskPayload),
  description: 'Create a new task, triggering a CreateCard for other viewers',
  args: {
    newTask: {
      type: new GraphQLNonNull(CreateTaskInput),
      description: 'The new task including an id, status, and type, and teamMemberId'
    },
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    }
  },
  async resolve(
    _source,
    {newTask}: ICreateTaskOnMutationArguments,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    const {
      meetingId,
      threadId,
      threadParentId,
      threadSortOrder,
      sortOrder,
      status,
      teamId,
      userId
    } = newTask
    const threadSource = newTask.threadSource as ThreadSourceEnum | null
    // const {teamId, userId, content} = validNewTask
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    const errors = await Promise.all([
      // threadParentId not validated because if it's invalid it simply won't appear
      validateTaskAgendaItemId(threadSource, threadId, teamId, dataLoader),
      validateThreadableReflectionGroupId(threadSource, threadId, meetingId, dataLoader),
      validateTaskMeetingId(meetingId, teamId, dataLoader),
      validateTaskUserId(userId, teamId, dataLoader)
    ])
    const firstError = errors.find(Boolean)
    if (firstError) {
      return standardError(new Error(firstError), {userId: viewerId})
    }

    // RESOLUTION
    const content = normalizeRawDraftJS(newTask.content)
    const task = new Task({
      content,
      createdBy: viewerId,
      meetingId,
      sortOrder,
      status,
      teamId,
      threadId,
      threadSource,
      threadSortOrder,
      threadParentId,
      userId
    })
    const {id: taskId, updatedAt, tags} = task
    const history = {
      id: shortid.generate(),
      content,
      taskId,
      status,
      teamId,
      userId,
      updatedAt
    }
    const {teamMembers} = await r({
      task: r.table('Task').insert(task),
      history: r.table('TaskHistory').insert(history),
      teamMembers: (r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isNotRemoved: true
        })
        .coerceTo('array') as unknown) as ITeamMember[]
    }).run()
    const usersIdsToIgnore = await getUsersToIgnore(viewerId, teamId, dataLoader)

    // Handle notifications
    // Almost always you start out with a blank card assigned to you (except for filtered team dash)
    const changeAuthorId = toTeamMemberId(teamId, viewerId)
    const notificationsToAdd = [] as NotificationTaskInvolves[]
    if (viewerId !== userId && !usersIdsToIgnore.includes(userId)) {
      notificationsToAdd.push(
        new NotificationTaskInvolves({
          involvement: 'ASSIGNEE',
          taskId,
          changeAuthorId,
          teamId,
          userId
        })
      )
    }

    const {entityMap} = JSON.parse(content)
    getTypeFromEntityMap('MENTION', entityMap)
      .filter(
        (mention) =>
          mention !== viewerId && mention !== userId && !usersIdsToIgnore.includes(mention)
      )
      .forEach((mentioneeUserId) => {
        notificationsToAdd.push(
          new NotificationTaskInvolves({
            userId: mentioneeUserId,
            involvement: 'MENTIONEE',
            taskId,
            changeAuthorId,
            teamId
          })
        )
      })
    const data = {taskId, notifications: notificationsToAdd}

    if (notificationsToAdd.length) {
      await r
        .table('Notification')
        .insert(notificationsToAdd)
        .run()
      notificationsToAdd.forEach((notification) => {
        publish(
          SubscriptionChannel.NOTIFICATION,
          notification.userId,
          'CreateTaskPayload',
          data,
          subOptions
        )
      })
    }

    const isPrivate = tags.includes('private')
    teamMembers.forEach((teamMember) => {
      if (!isPrivate || teamMember.userId === userId) {
        publish(SubscriptionChannel.TASK, teamMember.userId, 'CreateTaskPayload', data, subOptions)
      }
    })

    let isAsync
    if (meetingId) {
      const meeting = await dataLoader.get('newMeetings').load(meetingId)
      if (!meeting) return
      const {phases} = meeting
      const discussPhase = phases.find(
        (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.discuss
      )!
      const {stages} = discussPhase
      isAsync = stages.some((stage) => stage.isAsync)
    }

    sendSegmentEvent('Task added', viewerId, {
      meetingId,
      teamId,
      isAsync,
      isReply: !!threadParentId
    }).catch()

    return data
  }
}
