import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import deleteConflictingIntegratedTask from '../../../postgres/queries/deleteConflictingIntegratedTask'
import type {TeamMemberIntegrationAuth} from '../../../postgres/types/pg'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import isValid from '../../isValid'
import type {MutationResolvers} from '../resolverTypes'

type CopiedAuthColumn = Exclude<
  keyof TeamMemberIntegrationAuth,
  'id' | 'teamId' | 'createdAt' | 'updatedAt' | 'isActive'
>

// fails to compile when a column is added to TeamMemberIntegrationAuth but not listed here
const everyCopiedAuthColumn = <const T extends readonly CopiedAuthColumn[]>(
  columns: T & ([Exclude<CopiedAuthColumn, T[number]>] extends [never] ? unknown : never)
) => columns

const AUTH_COPY_COLUMNS = everyCopiedAuthColumn([
  'userId',
  'providerId',
  'service',
  'accessToken',
  'accessTokenSecret',
  'refreshToken',
  'scopes',
  'expiresAt',
  'providerUserId',
  'meta',
  'watchExpiresAt'
])

const changeTaskTeam: MutationResolvers['changeTaskTeam'] = async (
  _source,
  {taskId, teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const viewerId = getUserId(authToken)
  const task = await dataLoader.get('tasks').load(taskId)
  if (!task) {
    return standardError(new Error('Task not found'), {userId: viewerId})
  }
  const {tags, teamId: oldTeamId} = task
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
  let sourceAuthIdToCopy: number | null = null
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
        sourceAuthIdToCopy = sourceTeamAuth.id
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
  // If there is a task with the same integration hash in the new team, then delete it first.
  // This is done so there are no duplicates and also solves the issue of the conflicting task being
  // private or archived.
  const deletedTask = await pg.transaction().execute(async (trx) => {
    if (sourceAuthIdToCopy !== null) {
      await trx
        .insertInto('TeamMemberIntegrationAuth')
        .columns([...AUTH_COPY_COLUMNS, 'teamId'])
        .expression((eb) =>
          eb
            .selectFrom('TeamMemberIntegrationAuth')
            .select([...AUTH_COPY_COLUMNS, eb.val(teamId).as('teamId')])
            .where('id', '=', sourceAuthIdToCopy)
        )
        .onConflict((oc) =>
          oc.columns(['userId', 'teamId', 'service']).doUpdateSet((eb) => ({
            ...Object.fromEntries(
              AUTH_COPY_COLUMNS.map((column) => [column, eb.ref(`excluded.${column}`)])
            ),
            isActive: true
          }))
        )
        .execute()
    }
    const deleted = task.integrationHash
      ? await deleteConflictingIntegratedTask({teamId, integrationHash: task.integrationHash}, trx)
      : undefined
    await trx
      .updateTable('Task')
      .set({
        teamId,
        integration: JSON.stringify(integration)
      })
      .where('id', '=', taskId)
      .executeTakeFirst()
    return deleted
  })

  if (sourceAuthIdToCopy !== null && integration) {
    const targetTeamAuthKey = {teamId, userId: viewerId}
    if (integration.service === 'jira') {
      dataLoader.get('freshAtlassianAuth').clear(targetTeamAuthKey)
    } else {
      dataLoader.get('githubAuth').clear(targetTeamAuthKey)
    }
    dataLoader.get('teamMemberIntegrationAuthsByServiceTeamAndUserId').clear({
      service: integration.service,
      ...targetTeamAuthKey
    })
  }
  if (deletedTask) {
    const isPrivate = task.tags.includes('private')
    const data = {task}
    newTeamMembers.forEach(({userId}) => {
      if (!isPrivate || userId === task.userId) {
        publish(SubscriptionChannel.TASK, userId, 'DeleteTaskPayload', data, subOptions)
      }
    })
  }
  dataLoader.clearAll('tasks')
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

export default changeTaskTeam
