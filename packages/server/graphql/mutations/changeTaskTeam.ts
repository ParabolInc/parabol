import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeEntityKeepText from 'parabol-client/utils/draftjs/removeEntityKeepText'
import getRethink from '../../database/rethinkDriver'
import {RValue} from '../../database/stricterR'
import Task from '../../database/types/Task'
import generateUID from '../../generateUID'
import {AtlassianAuth} from '../../postgres/queries/getAtlassianAuthByUserIdTeamId'
import {GitHubAuth} from '../../postgres/queries/getGitHubAuthByUserIdTeamId'
import upsertAtlassianAuths from '../../postgres/queries/upsertAtlassianAuths'
import upsertGitHubAuth from '../../postgres/queries/upsertGitHubAuth'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import isValid from '../isValid'
import ChangeTaskTeamPayload from '../types/ChangeTaskTeamPayload'

export default {
  type: ChangeTaskTeamPayload,
  description:
    'Change the team a task is associated with. Also copy the viewers integration if necessary.',
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
    const task = await r.table('Task').get(taskId).run()
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

    const {integration} = task
    if (integration) {
      // The task might have been pushed by someone else for viewer (`userId !== accessUserId`).
      // In that case we still try to use the viewer's target team authentication, but fall back to the
      // accessUser's in case it is present for the target team.
      const targetTeamAuthKey = {teamId, userId: viewerId}
      const authKeys = [
        {teamId: task.teamId, userId: viewerId},
        targetTeamAuthKey,
        {teamId, userId: integration.accessUserId}
      ]
      const [sourceTeamAuth, targetTeamAuth, accessUsersTargetTeamAuth] =
        task.integration?.service === 'jira'
          ? await Promise.all(authKeys.map((key) => dataLoader.get('freshAtlassianAuth').load(key)))
          : task.integration?.service === 'github'
          ? await Promise.all(authKeys.map((key) => dataLoader.get('githubAuth').load(key)))
          : authKeys.map(() => null)

      if (!targetTeamAuth && !sourceTeamAuth && !accessUsersTargetTeamAuth) {
        return standardError(new Error('No valid integration found'), {
          userId: viewerId
        })
      }

      // Transfer integration to target team
      if (task.integration) {
        if (sourceTeamAuth && !targetTeamAuth) {
          if (task.integration.service === 'jira') {
            await upsertAtlassianAuths([
              {
                ...(sourceTeamAuth as AtlassianAuth),
                teamId
              }
            ])
            // dataLoader does not allow to refresh the value, so clear the updated one
            dataLoader.get('freshAtlassianAuth').clear(targetTeamAuthKey)
            const data = {teamId, userId: viewerId}
            publish(SubscriptionChannel.TEAM, teamId, 'AddAtlassianAuthPayload', data, subOptions)
          }
          if (task.integration.service === 'github') {
            await upsertGitHubAuth({
              ...(sourceTeamAuth as GitHubAuth),
              teamId
            })
            // dataLoader does not allow to refresh the value, so clear the updated one
            dataLoader.get('githubAuth').clear(targetTeamAuthKey)
            const data = {teamId, userId: viewerId}
            publish(SubscriptionChannel.TEAM, teamId, 'AddGitHubAuthPayload', data, subOptions)
          }
          integration.accessUserId = viewerId
        } else if (targetTeamAuth) {
          // in case the task was pushed by someone else before
          integration.accessUserId = viewerId
        }
        // else the task might also be integrated and the accessUser has the integration set up for the target team, do nothing in that case
      }
    }

    // filter mentions of old team members from task content
    const teamMemberRes = (
      await dataLoader.get('teamMembersByTeamId').loadMany([oldTeamId, teamId])
    ).filter(isValid)
    const oldTeamMembers = teamMemberRes[0]!
    const newTeamMembers = teamMemberRes[1]!
    const oldTeamUserIds = oldTeamMembers.map(({userId}) => userId)
    const newTeamUserIds = newTeamMembers.map(({userId}) => userId)
    const userIdsOnlyOnOldTeam = oldTeamUserIds.filter((oldTeamUserId) => {
      return !newTeamUserIds.find((newTeamUserId) => newTeamUserId === oldTeamUserId)
    })
    const rawContent = JSON.parse(content)
    const eqFn = (entity: {type: string; data: {userId?: string}}) =>
      entity.type === 'MENTION' &&
      Boolean(userIdsOnlyOnOldTeam.find((userId) => userId === entity.data.userId))
    const {rawContent: nextRawContent} = removeEntityKeepText(rawContent, eqFn)

    const updates = {
      content: rawContent === nextRawContent ? undefined : JSON.stringify(nextRawContent),
      updatedAt: now,
      teamId,
      integration
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
          .delete({returnChanges: true})('changes')(0)('old_val')
          .default(null),
      newTask: r.table('Task').get(taskId).update(updates),
      taskHistory: r
        .table('TaskHistory')
        .between([taskId, r.minval], [taskId, r.maxval], {
          index: 'taskIdUpdatedAt'
        })
        .orderBy({index: 'taskIdUpdatedAt'})
        .nth(-1)
        .default(null)
        .do((taskHistoryRecord: RValue) => {
          // prepopulated cards will not have a history
          return r.branch(
            taskHistoryRecord.ne(null),
            r.table('TaskHistory').insert(taskHistoryRecord.merge(updates, {id: generateUID()})),
            null
          )
        })
    }).run()

    if (deletedConflictingIntegrationTask) {
      const task = deletedConflictingIntegrationTask as unknown as Task
      const isPrivate = task.tags.includes('private')
      const data = {task}
      newTeamMembers.forEach(({userId}) => {
        if (!isPrivate || userId === task.userId) {
          publish(SubscriptionChannel.TASK, userId, 'DeleteTaskPayload', data, subOptions)
        }
      })
    }

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
