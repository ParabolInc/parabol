import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import ChangeTaskTeamPayload from '../types/ChangeTaskTeamPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import shortid from 'shortid'
import removeEntityKeepText from '../../../client/utils/draftjs/removeEntityKeepText'
import {TASK, TASK_INVOLVES} from '../../../client/utils/constants'
import publish from '../../utils/publish'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import standardError from '../../utils/standardError'

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
  async resolve(_source, {taskId, teamId}, {authToken, dataLoader, socketId: mutatorId}) {
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
    const {rawContent: nextRawContent, removedEntities} = removeEntityKeepText(rawContent, eqFn)

    const updates = {
      content: rawContent === nextRawContent ? undefined : JSON.stringify(nextRawContent),
      updatedAt: now,
      teamId,
      assigneeId: toTeamMemberId(teamId, task.userId)
    }
    await r({
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
            r
              .table('TaskHistory')
              .insert(taskHistoryRecord.merge(updates, {id: shortid.generate()})),
            null
          )
        })
    }).run()

    const mentioneeUserIdsToRemove = Array.from(
      new Set(removedEntities.map(({data}) => data.userId))
    )
    const notificationsToRemove =
      mentioneeUserIdsToRemove.length === 0
        ? []
        : await r
            .table('Notification')
            .getAll(r.args(mentioneeUserIdsToRemove), {index: 'userIds'})
            .filter({
              taskId,
              type: TASK_INVOLVES
            })
            .delete({returnChanges: true})('changes')('old_val')
            .default([])
            .pluck('id', 'userIds')
            .run()

    const isPrivate = tags.includes('private')
    const data = {taskId, notificationsToRemove}
    const teamMembers = oldTeamMembers.concat(newTeamMembers)
    teamMembers.forEach(({userId}) => {
      if (!isPrivate || userId === task.userId) {
        publish(TASK, userId, ChangeTaskTeamPayload, data, subOptions)
      }
    })
    return data
  }
}
