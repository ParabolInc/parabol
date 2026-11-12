import nullIfEmpty from 'parabol-client/utils/nullIfEmpty'
import type {KickedOutNotification} from '../../../postgres/types/Notification'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import isValid from '../../isValid'
import type {RemoveTeamMemberPayloadResolvers} from '../resolverTypes'

export type RemoveTeamMemberPayloadSource =
  | {
      teamMemberId: string
      teamId: string
      taskIds: string[]
      userId: string
      notificationId: string | undefined
    }
  | {error: {message: string}}

const RemoveTeamMemberPayload: RemoveTeamMemberPayloadResolvers = {
  teamMember: async (source, _args, {dataLoader}: GQLContext) => {
    if ('error' in source) return null
    return dataLoader.get('teamMembers').loadNonNull(source.teamMemberId)
  },
  team: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('teams').loadNonNull(source.teamId)
  },
  updatedTasks: async (source, _args, {authToken, dataLoader}: GQLContext) => {
    if ('error' in source) return null
    const {taskIds} = source
    if (!taskIds || taskIds.length === 0) return null
    const tasks = (await dataLoader.get('tasks').loadMany(taskIds)).filter(isValid)
    const {userId} = tasks[0]!
    const isViewer = userId === getUserId(authToken)
    const teamTasks = tasks.filter(({teamId}) => authToken.tms.includes(teamId))
    return isViewer ? teamTasks : nullIfEmpty(teamTasks.filter((p) => !p.tags.includes('private')))
  },
  user: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('users').loadNonNull(source.userId)
  },
  kickOutNotification: async (source, _args, {authToken, dataLoader}) => {
    if ('error' in source) return null
    const {notificationId} = source
    if (!notificationId) return null
    const viewerId = getUserId(authToken)
    const notification = await dataLoader
      .get('notifications')
      .load<KickedOutNotification>(notificationId)
    if (!notification || notification.userId !== viewerId) return null
    return notification
  }
}

export default RemoveTeamMemberPayload
