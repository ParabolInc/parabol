import {generateText} from '@tiptap/core'
import {GraphQLNonNull, GraphQLObjectType, GraphQLResolveInfo} from 'graphql'
import {Insertable} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import MeetingMemberId from '../../../client/shared/gqlIds/MeetingMemberId'
import {getAllNodesAttributesByType} from '../../../client/shared/tiptap/getAllNodesAttributesByType'
import {getTagsFromTipTapTask} from '../../../client/shared/tiptap/getTagsFromTipTapTask'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import dndNoise from '../../../client/utils/dndNoise'
import generateUID from '../../generateUID'
import updatePrevUsedRepoIntegrationsCache from '../../integrations/updatePrevUsedRepoIntegrationsCache'
import getKysely from '../../postgres/getKysely'
import {Task} from '../../postgres/types/index.d'
import {Notification} from '../../postgres/types/pg'
import {TaskServiceEnum} from '../../postgres/types/TaskIntegration'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import {convertToTipTap} from '../../utils/convertToTipTap'
import publish, {SubOptions} from '../../utils/publish'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import AreaEnum from '../types/AreaEnum'
import CreateTaskInput, {CreateTaskInputType} from '../types/CreateTaskInput'
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
  task: Pick<Task, 'id' | 'content' | 'tags' | 'userId'>,
  viewerId: string,
  teamId: string,
  subOptions: SubOptions
) => {
  const pg = getKysely()
  const {id: taskId, content, tags, userId} = task
  const usersIdsToIgnore = await getUsersToIgnore(viewerId, teamId)

  // Handle notifications
  // Almost always you start out with a blank card assigned to you (except for filtered team dash)
  const changeAuthorId = toTeamMemberId(teamId, viewerId)
  const notificationsToAdd = [] as Insertable<Notification>[]
  if (userId && viewerId !== userId && !usersIdsToIgnore.includes(userId)) {
    notificationsToAdd.push({
      id: generateUID(),
      type: 'TASK_INVOLVES' as const,
      involvement: 'ASSIGNEE' as const,
      taskId,
      changeAuthorId,
      teamId,
      userId
    })
  }

  const jsonContent = JSON.parse(content)
  getAllNodesAttributesByType<{id: string; label: string}>(jsonContent, 'mention')
    .filter(
      (mention) =>
        mention.id !== viewerId && mention.id !== userId && !usersIdsToIgnore.includes(mention.id)
    )
    .forEach((mentionee) => {
      notificationsToAdd.push({
        id: generateUID(),
        type: 'TASK_INVOLVES' as const,
        userId: mentionee.id,
        involvement: 'MENTIONEE',
        taskId,
        changeAuthorId,
        teamId
      })
    })
  const data = {taskId, notifications: notificationsToAdd}

  if (notificationsToAdd.length) {
    await pg.insertInto('Notification').values(notificationsToAdd).execute()
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
  type: new GraphQLNonNull(
    new GraphQLObjectType({
      name: 'CreateTaskPayload',
      fields: {}
    })
  ),
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
    const pg = getKysely()
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

    const [viewer, ...errors] = await Promise.all([
      dataLoader.get('users').loadNonNull(viewerId),
      // threadParentId not validated because if it's invalid it simply won't appear
      validateTaskDiscussionId(newTask, dataLoader),
      validateTaskMeetingId(meetingId, viewerId, dataLoader),
      validateTaskUserIsTeamMember(userId, teamId, dataLoader)
    ])
    const firstError = errors.find(Boolean)
    if (firstError) {
      return standardError(new Error(firstError), {userId: viewerId})
    }

    const content = convertToTipTap(newTask.content)
    const plaintextContent = generateText(content, serverTipTapExtensions)

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
    const {integrationHash, integration, integrationRepoId} = integrationRes
    if (integrationRepoId) {
      updatePrevUsedRepoIntegrationsCache(teamId, integrationRepoId, viewerId)
    }
    const task = {
      id: generateUID(),
      content: JSON.stringify(content),
      plaintextContent,
      createdBy: viewerId,
      meetingId,
      sortOrder: sortOrder || dndNoise(),
      status,
      teamId,
      discussionId,
      integrationHash,
      integration: JSON.stringify(integration),
      threadSortOrder,
      threadParentId,
      userId: userId || null,
      tags: getTagsFromTipTapTask(content)
    }
    const {id: taskId} = task
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    await pg.insertInto('Task').values(task).execute()
    // FIXME
    handleAddTaskNotifications(teamMembers, task, viewerId, teamId, {
      operationId,
      mutatorId
    }).catch(() => {
      /*ignore*/
    })

    const meeting = meetingId ? await dataLoader.get('newMeetings').load(meetingId) : undefined
    const taskProperties = {
      taskId,
      teamId,
      meetingId: meeting?.id,
      meetingType: meeting?.meetingType,
      inMeeting: !!meetingId
    }
    analytics.taskCreated(viewer, taskProperties)
    if (integration?.service) {
      analytics.taskPublished(viewer, taskProperties, integration.service)
    }
    return {taskId}
  }
}
