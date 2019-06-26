import {GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import getUsersToIgnore from 'server/graphql/mutations/helpers/getUsersToIgnore'
import AreaEnum from 'server/graphql/types/AreaEnum'
import CreateTaskInput from 'server/graphql/types/CreateTaskInput'
import CreateTaskPayload from 'server/graphql/types/CreateTaskPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import shortid from 'shortid'
import {NOTIFICATION, TASK} from 'universal/utils/constants'
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import standardError from 'server/utils/standardError'
import Task from 'server/database/types/Task'
import {ICreateTaskOnMutationArguments} from 'universal/types/graphql'
import {DataLoaderWorker, GQLContext} from 'server/graphql/graphql'
import normalizeRawDraftJS from 'universal/validation/normalizeRawDraftJS'
import NotificationTaskInvolves from 'server/database/types/NotificationTaskInvolves'

const validateTaskAgendaItemId = async (
  agendaItemId: string | null | undefined,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  if (agendaItemId) {
    const agendaItem = await dataLoader.get('agendaItems').load(agendaItemId)
    if (!agendaItem || agendaItem.teamId !== teamId) {
      return 'Invalid agenda item ID'
    }
  }
  return undefined
}

const validateTaskReflectionGroupId = async (
  reflectionGroupId: string | null | undefined,
  meetingId: string | null | undefined,
  dataLoader: DataLoaderWorker
) => {
  if (reflectionGroupId) {
    const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
    if (!reflectionGroup || reflectionGroup.meetingId !== meetingId) {
      return 'Invalid reflection group ID'
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

const validateTaskUserId = async (userId: string, teamId: string, dataLoader: DataLoaderWorker) => {
  const teamMemberId = toTeamMemberId(teamId, userId)
  const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
  return teamMember ? undefined : 'Invalid user ID'
}

export default {
  type: CreateTaskPayload,
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
  async resolve (
    _source,
    {newTask}: ICreateTaskOnMutationArguments,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    const {agendaId, meetingId, reflectionGroupId, sortOrder, status, teamId, userId} = newTask
    // const {teamId, userId, content} = validNewTask
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    const errors = await Promise.all([
      validateTaskAgendaItemId(agendaId, teamId, dataLoader),
      validateTaskReflectionGroupId(reflectionGroupId, meetingId, dataLoader),
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
      agendaId,
      content,
      createdBy: viewerId,
      meetingId,
      reflectionGroupId,
      sortOrder,
      status,
      teamId,
      userId
    })
    const {id: taskId, assigneeId, updatedAt, tags} = task
    const history = {
      id: shortid.generate(),
      content,
      taskId,
      status,
      assigneeId,
      updatedAt
    }
    const {teamMembers} = await r({
      task: r.table('Task').insert(task),
      history: r.table('TaskHistory').insert(history),
      teamMembers: r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isNotRemoved: true
        })
        .coerceTo('array')
    })
    const usersIdsToIgnore = await getUsersToIgnore(meetingId, dataLoader)

    // Handle notifications
    // Almost always you start out with a blank card assigned to you (except for filtered team dash)
    const changeAuthorId = toTeamMemberId(teamId, viewerId)
    const notificationsToAdd = [] as NotificationTaskInvolves[]
    if (changeAuthorId !== assigneeId && !usersIdsToIgnore.includes(userId)) {
      notificationsToAdd.push(
        new NotificationTaskInvolves({
          involvement: 'ASSIGNEE',
          taskId,
          changeAuthorId,
          teamId,
          userIds: [userId]
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
            userIds: [mentioneeUserId],
            involvement: 'MENTIONEE',
            taskId,
            changeAuthorId,
            teamId
          })
        )
      })
    const data = {taskId, notifications: notificationsToAdd}

    if (notificationsToAdd.length) {
      await r.table('Notification').insert(notificationsToAdd)
      notificationsToAdd.forEach((notification) => {
        const {
          userIds: [notificationUserId]
        } = notification
        publish(NOTIFICATION, notificationUserId, CreateTaskPayload, data, subOptions)
      })
    }

    const isPrivate = tags.includes('private')
    teamMembers.forEach((teamMember) => {
      if (!isPrivate || teamMember.userId === userId) {
        publish(TASK, teamMember.userId, CreateTaskPayload, data, subOptions)
      }
    })
    return data
  }
}
