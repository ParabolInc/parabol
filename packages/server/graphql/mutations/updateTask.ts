import {generateText} from '@tiptap/core'
import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getTagsFromTipTapTask} from '../../../client/shared/tiptap/getTagsFromTipTapTask'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import getKysely from '../../postgres/getKysely'
import {Task} from '../../postgres/types/index'
import {getUserId, isTeamMember} from '../../utils/authorization'
import {convertToTipTap} from '../../utils/convertToTipTap'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AreaEnum from '../types/AreaEnum'
import UpdateTaskInput from '../types/UpdateTaskInput'
import {validateTaskUserIsTeamMember} from './createTask'
import getUsersToIgnore from './helpers/getUsersToIgnore'
import publishChangeNotifications from './helpers/publishChangeNotifications'

type UpdateTaskInput = {
  id: string
  content?: string | null
  sortOrder?: number | null
  status?: Task['status'] | null
  userId?: string | null
}
type UpdateTaskMutationVariables = {
  updatedTask: UpdateTaskInput
  area?: 'meeting' | 'teamDash' | 'userDash' | null
}
export default {
  type: new GraphQLObjectType({
    name: 'UpdateTaskPayload',
    fields: {}
  }),
  description: 'Update a task with a change in content, ownership, or status',
  args: {
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    },
    updatedTask: {
      type: new GraphQLNonNull(UpdateTaskInput),
      description: 'the updated task including the id, and at least one other field'
    }
  },
  async resolve(
    _source: unknown,
    {updatedTask}: UpdateTaskMutationVariables,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // VALIDATION
    const {id: taskId, userId: inputUserId, status, sortOrder, content} = updatedTask

    const validContent = convertToTipTap(content)
    const plaintextContent = content
      ? generateText(validContent, serverTipTapExtensions)
      : undefined

    const [task, viewer] = await Promise.all([
      dataLoader.get('tasks').load(taskId),
      dataLoader.get('users').loadNonNull(viewerId)
    ])
    if (!task) {
      return {error: {message: 'Task not found'}}
    }
    const {teamId, userId} = task
    const nextUserId = inputUserId === undefined ? userId : inputUserId
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (teamId || inputUserId) {
      const error = await validateTaskUserIsTeamMember(nextUserId, teamId, dataLoader)
      if (error) {
        return standardError(new Error('Invalid user ID'), {userId: viewerId})
      }
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
    dataLoader.clearAll('tasks')
    const newTask = await dataLoader.get('tasks').loadNonNull(taskId)
    // TODO: get users in the same location
    const usersToIgnore = await getUsersToIgnore(viewerId, teamId)

    // send task updated messages
    const isPrivate = newTask.tags.includes('private')
    const wasPrivate = task.tags.includes('private')
    const isPrivatized = isPrivate && !wasPrivate
    const isPublic = !isPrivate || isPrivatized

    // get notification diffs
    const {notificationsToAdd} = await publishChangeNotifications(
      newTask,
      task,
      viewer,
      usersToIgnore
    )
    const data = {
      isPrivatized,
      taskId,
      notificationsToAdd
    }
    teamMembers.forEach(({userId}) => {
      if (isPublic || userId === newTask.userId || userId === viewerId) {
        publish(SubscriptionChannel.TASK, userId, 'UpdateTaskPayload', data, subOptions)
      }
    })

    return data
  }
}
