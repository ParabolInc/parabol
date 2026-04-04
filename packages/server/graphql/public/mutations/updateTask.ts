import {generateText} from '@tiptap/core'
import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {convertTiptapToADF} from '../../../../client/shared/tiptap/convertTipTapToADF'
import {getTagsFromTipTapTask} from '../../../../client/shared/tiptap/getTagsFromTipTapTask'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../../postgres/getKysely'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {getUserId} from '../../../utils/authorization'
import {convertToTipTap} from '../../../utils/convertToTipTap'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import getUsersToIgnore from '../../mutations/helpers/getUsersToIgnore'
import publishChangeNotifications from '../../mutations/helpers/publishChangeNotifications'
import type {MutationResolvers} from '../resolverTypes'
import {validateTaskUserIsTeamMember} from './createTask'

const updateTask: MutationResolvers['updateTask'] = async (
  _source,
  {updatedTask},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // VALIDATION
  const {id: taskId, userId: inputUserId, status, sortOrder, content} = updatedTask

  const validContent = convertToTipTap(content)
  const plaintextContent = content ? generateText(validContent, serverTipTapExtensions) : undefined

  const [task, viewer] = await Promise.all([
    dataLoader.get('tasks').load(taskId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!task) return {error: {message: 'Task not found'}}
  const {teamId, userId} = task
  const nextUserId = inputUserId === undefined ? userId : inputUserId
  if (teamId || inputUserId) {
    const error = await validateTaskUserIsTeamMember(nextUserId, teamId, dataLoader)
    if (error) return standardError(new Error('Invalid user ID'), {userId: viewerId})
  }

  // RESOLUTION
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const updateRes = await pg
    .updateTable('Task')
    .set({
      content: content ? validContent : undefined,
      plaintextContent,
      sortOrder: sortOrder || undefined,
      status: status || undefined,
      userId: inputUserId || undefined,
      tags: content ? getTagsFromTipTapTask(validContent) : undefined
    })
    .where('id', '=', taskId)
    .executeTakeFirst()
  if (Number(updateRes.numChangedRows) === 0) {
    return standardError(new Error('Already updated task'), {userId: viewerId})
  }
  // If the task has a Jira integration and content was updated, sync the description to Jira
  if (content && task.integration?.service === 'jira') {
    const {cloudId, issueKey} = task.integration
    const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: viewerId})
    if (auth) {
      const manager = new AtlassianServerManager(auth.accessToken)
      const adf = convertTiptapToADF(validContent as TipTapSerializedContent)
      // fire-and-forget; don't block the response on Jira's API
      manager.updateDescription(cloudId, issueKey, adf).catch(() => {})
    }
  }

  dataLoader.clearAll('tasks')
  const newTask = await dataLoader.get('tasks').loadNonNull(taskId)
  const usersToIgnore = await getUsersToIgnore(newTask.meetingId)

  const isPrivate = newTask.tags.includes('private')
  const wasPrivate = task.tags.includes('private')
  const isPrivatized = isPrivate && !wasPrivate
  const isPublic = !isPrivate || isPrivatized

  const {notificationsToAdd} = await publishChangeNotifications(
    newTask,
    task,
    viewer,
    usersToIgnore
  )
  const data = {isPrivatized, taskId, notificationsToAdd}
  teamMembers.forEach(({userId}) => {
    if (isPublic || userId === newTask.userId || userId === viewerId) {
      publish(SubscriptionChannel.TASK, userId, 'UpdateTaskPayload', data, subOptions)
    }
  })
  return data
}

export default updateTask
