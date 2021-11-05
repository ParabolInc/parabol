import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeEntityKeepText from 'parabol-client/utils/draftjs/removeEntityKeepText'
import getRethink from '../../database/rethinkDriver'
import generateUID from '../../generateUID'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import ChangeTaskTeamPayload from '../types/ChangeTaskTeamPayload'

export default {
  type: ChangeTaskTeamPayload,
  description: 'Change the team a task is associated with',
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The task to change'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The new team to assign the task to'
    }
  },
  async resolve(
    _source: unknown,
    {taskId, teamId}: {taskId: string; teamId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    const task = await r
      .table('Task')
      .get(taskId)
      .run()
    if (!task) {
      return standardError(new Error('Task not found'), {userId: viewerId})
    }
    const {content, tags, teamId: oldTeamId} = task
    if (!isTeamMember(authToken, oldTeamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (task.userId !== viewerId) {
      return standardError(new Error('Cannot change team for a task assigned to someone else'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    // filter mentions of old team members from task content
    const [oldTeamMembers, newTeamMembers] = await dataLoader
      .get('teamMembersByTeamId')
      .loadMany([oldTeamId, teamId])
    const oldTeamUserIds = oldTeamMembers.map(({userId}) => userId)
    const newTeamUserIds = newTeamMembers.map(({userId}) => userId)
    const userIdsOnlyOnOldTeam = oldTeamUserIds.filter((oldTeamUserId) => {
      return !newTeamUserIds.find((newTeamUserId) => newTeamUserId === oldTeamUserId)
    })
    const rawContent = JSON.parse(content)
    const eqFn = (entity) =>
      entity.type === 'MENTION' &&
      Boolean(userIdsOnlyOnOldTeam.find((userId) => userId === entity.data.userId))
    const {rawContent: nextRawContent} = removeEntityKeepText(rawContent, eqFn)

    const updates = {
      content: rawContent === nextRawContent ? undefined : JSON.stringify(nextRawContent),
      updatedAt: now,
      teamId
    }

    // If there is a task with the same integration hash in the new team, then delete it first.
    // This is done so there are no duplicates and also solves the issue of the conflicting task being
    // private or archived.
    const {deletedConflictingIntegrationTask} = await r({
      deletedConflictingIntegrationTask:
        task.integrationHash &&
        r
          .table('Task')
          .getAll(task.integrationHash, {index: 'integrationHash'})
          .filter({teamId})
          .delete({returnChanges: true}),
      newTask: r
        .table('Task')
        .get(taskId)
        .update(updates),
      taskHistory: r
        .table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {
          index: 'taskIdUpdatedAt'
        })
        .orderBy({index: 'taskIdUpdatedAt'})
        .nth(-1)
        .default(null)
        .do((taskHistoryRecord) => {
          // prepopulated cards will not have a history
          return r.branch(
            taskHistoryRecord.ne(null),
            r.table('TaskHistory').insert(taskHistoryRecord.merge(updates, {id: generateUID()})),
            null
          )
        })
    }).run()

    const deletedTasks = (deletedConflictingIntegrationTask as any)?.changes?.map(
      ({old_val}) => old_val
    )
    deletedTasks?.forEach((task) => {
      const isPrivate = task.tags.includes('private')
      const data = {task}
      newTeamMembers.forEach(({userId}) => {
        if (!isPrivate || userId === task.userId) {
          publish(SubscriptionChannel.TASK, userId, 'DeleteTaskPayload', data, subOptions)
        }
      })
    })

    const isPrivate = tags.includes('private')
    const data = {taskId}
    const teamMembers = oldTeamMembers.concat(newTeamMembers)
    teamMembers.forEach(({userId}) => {
      if (!isPrivate || userId === task.userId) {
        publish(SubscriptionChannel.TASK, userId, 'ChangeTaskTeamPayload', data, subOptions)
      }
    })
    return data
  }
}
