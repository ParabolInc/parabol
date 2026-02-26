import {generateText} from '@tiptap/core'
import type {Insertable} from 'kysely'
import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import {getAllNodesAttributesByType} from 'parabol-client/shared/tiptap/getAllNodesAttributesByType'
import {getTagsFromTipTapTask} from 'parabol-client/shared/tiptap/getTagsFromTipTapTask'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import dndNoise from 'parabol-client/utils/dndNoise'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import generateUID from '../../../generateUID'
import updatePrevUsedRepoIntegrationsCache from '../../../integrations/updatePrevUsedRepoIntegrationsCache'
import getKysely from '../../../postgres/getKysely'
import type {Task} from '../../../postgres/types/index.d'
import type {Notification} from '../../../postgres/types/pg'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {convertToTipTap} from '../../../utils/convertToTipTap'
import publish from '../../../utils/publish'
import type {DataLoaderWorker} from '../../graphql'
import createTaskInService from '../../mutations/helpers/createTaskInService'
import getUsersToIgnore from '../../mutations/helpers/getUsersToIgnore'
import type {MutationResolvers} from '../resolverTypes'

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
  discussionId: string | null | undefined,
  teamId: string,
  meetingId: string | null | undefined,
  dataLoader: DataLoaderWorker
) => {
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
  meetingId: string | undefined | null,
  subOptions: {operationId: string; mutatorId: string}
) => {
  const pg = getKysely()
  const {id: taskId, content, tags, userId} = task
  const usersIdsToIgnore = await getUsersToIgnore(meetingId)

  // Handle notifications
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

  const notificationIds = notificationsToAdd.map((n) => n.id!)
  const data = {taskId, notificationIds}

  if (notificationsToAdd.length) {
    await pg.insertInto('Notification').values(notificationsToAdd).execute()
    notificationsToAdd.forEach((notification) => {
      publish(
        SubscriptionChannel.NOTIFICATION,
        notification.userId!,
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

  return notificationIds
}

const createTask: MutationResolvers['createTask'] = async (
  _source,
  {newTask, area: _area},
  context,
  info
) => {
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
    validateTaskDiscussionId(discussionId, teamId, meetingId, dataLoader),
    validateTaskMeetingId(meetingId, viewerId, dataLoader),
    validateTaskUserIsTeamMember(userId, teamId, dataLoader)
  ])
  const firstError = errors.find(Boolean)
  if (firstError) {
    return {error: {message: firstError as string}}
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
    return {error: {message: integrationRes.error.message}}
  }

  // RESOLUTION
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
    threadSortOrder: threadSortOrder ?? undefined,
    threadParentId: threadParentId ?? undefined,
    userId: userId || null,
    tags: getTagsFromTipTapTask(content)
  }
  const {id: taskId} = task
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  await pg.insertInto('Task').values(task).execute()

  const notificationIds = await handleAddTaskNotifications(
    teamMembers,
    task,
    viewerId,
    teamId,
    meetingId,
    {
      operationId,
      mutatorId
    }
  ).catch(() => [] as string[])

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

  return {taskId, notificationIds}
}

export default createTask
