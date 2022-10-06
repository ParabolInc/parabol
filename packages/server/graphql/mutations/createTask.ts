import {GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getTypeFromEntityMap from 'parabol-client/utils/draftjs/getTypeFromEntityMap'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import normalizeRawDraftJS from 'parabol-client/validation/normalizeRawDraftJS'
import MeetingMemberId from '../../../client/shared/gqlIds/MeetingMemberId'
import getRethink from '../../database/rethinkDriver'
import NotificationTaskInvolves from '../../database/types/NotificationTaskInvolves'
import Task, {TaskServiceEnum} from '../../database/types/Task'
import TeamMember from '../../database/types/TeamMember'
import generateUID from '../../generateUID'
import updateRepoIntegrationsCache from '../../integrations/updateRepoIntegrationsCache'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish, {SubOptions} from '../../utils/publish'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import AreaEnum from '../types/AreaEnum'
import CreateTaskInput, {CreateTaskInputType} from '../types/CreateTaskInput'
import CreateTaskPayload from '../types/CreateTaskPayload'
import createTaskInService from './helpers/createTaskInService'
import getUsersToIgnore from './helpers/getUsersToIgnore'

const validateTaskMeetingId = async (
  meetingId: string | null | undefined,
  viewerId: string,
  dataLoader: DataLoaderWorker
) => {
  if (!meetingId) return undefined
  const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
  const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
  if (!meetingMember) return 'Viewer is not in meeting'
  return undefined
}

export const validateTaskUserIsTeamMember = async (
  userId: string | null | undefined,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  if (!userId) return undefined
  const teamMemberId = toTeamMemberId(teamId, userId)
  const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
  return teamMember ? undefined : 'Invalid user ID'
}

const validateTaskDiscussionId = async (
  task: CreateTaskInputType,
  dataLoader: DataLoaderWorker
) => {
  const {discussionId, teamId, meetingId} = task
  if (!discussionId) return undefined
  const discussion = await dataLoader.get('discussions').load(discussionId)
  if (!discussion) return 'Invalid discussion'
  if (discussion.meetingId !== meetingId)
    return 'Discussion meetingId does not match task meetingId'
  if (discussion.teamId !== teamId) return 'Discussion teamId does not match task teamId'
  return undefined
}

const handleAddTaskNotifications = async (
  teamMembers: any[],
  task: Task,
  viewerId: string,
  teamId: string,
  subOptions: SubOptions
) => {
  const r = await getRethink()
  const {id: taskId, content, tags, userId} = task
  const usersIdsToIgnore = await getUsersToIgnore(viewerId, teamId)

  // Handle notifications
  // Almost always you start out with a blank card assigned to you (except for filtered team dash)
  const changeAuthorId = toTeamMemberId(teamId, viewerId)
  const notificationsToAdd = [] as NotificationTaskInvolves[]
  if (userId && viewerId !== userId && !usersIdsToIgnore.includes(userId)) {
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
      (mention) => mention !== viewerId && mention !== userId && !usersIdsToIgnore.includes(mention)
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
    // don't await to speed up task creation
    r.table('Notification').insert(notificationsToAdd).run()
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
}

export interface CreateTaskIntegrationInput {
  service: TaskServiceEnum
  serviceProjectHash: string
}

export default {
  type: new GraphQLNonNull(CreateTaskPayload),
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
    _source: unknown,
    {newTask}: {newTask: CreateTaskInputType},
    context: GQLContext,
    info: GraphQLResolveInfo
  ) {
    const {authToken, dataLoader, socketId: mutatorId} = context
    const r = await getRethink()
    const operationId = dataLoader.share()
    const viewerId = getUserId(authToken)

    const {
      meetingId,
      discussionId,
      threadParentId,
      threadSortOrder,
      sortOrder,
      status,
      teamId,
      userId
    } = newTask
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on team'}}
    }

    const errors = await Promise.all([
      // threadParentId not validated because if it's invalid it simply won't appear
      validateTaskDiscussionId(newTask, dataLoader),
      validateTaskMeetingId(meetingId, viewerId, dataLoader),
      validateTaskUserIsTeamMember(userId, teamId, dataLoader)
    ])
    const firstError = errors.find(Boolean)
    if (firstError) {
      return standardError(new Error(firstError), {userId: viewerId})
    }

    const content = normalizeRawDraftJS(newTask.content)

    // see if the task already exists
    const integrationRes = await createTaskInService(
      newTask.integration,
      content,
      viewerId,
      teamId,
      context,
      info
    )
    if (integrationRes.error) {
      return integrationRes
    }
    // RESOLUTION

    // push to integration
    const {integrationHash, integration} = integrationRes
    console.log('🚀 ~ create task _______', integrationRes)
    if (integration) {
      updateRepoIntegrationsCache(teamId, integration)
    }
    const task = new Task({
      content,
      createdBy: viewerId,
      meetingId,
      sortOrder,
      status,
      teamId,
      discussionId,
      integrationHash,
      integration,
      threadSortOrder,
      threadParentId,
      userId
    })
    const {id: taskId, updatedAt} = task
    const history = {
      id: generateUID(),
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
      teamMembers: r
        .table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isNotRemoved: true
        })
        .coerceTo('array') as unknown as TeamMember[]
    }).run()

    handleAddTaskNotifications(teamMembers, task, viewerId, teamId, {
      operationId,
      mutatorId
    }).catch()

    const meeting = meetingId ? await dataLoader.get('newMeetings').load(meetingId) : undefined
    const taskProperties = {
      taskId,
      teamId,
      meetingId: meeting?.id,
      meetingType: meeting?.meetingType,
      inMeeting: !!meetingId
    }
    analytics.taskCreated(viewerId, taskProperties)
    if (integration?.service) {
      analytics.taskPublished(viewerId, taskProperties, integration.service)
    }
    return {taskId}
  }
}
