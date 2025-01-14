import {KickedOutNotification} from '../../../postgres/types/Notification'
import isValid from '../../isValid'
import {RemoveMultipleOrgUsersSuccessResolvers} from '../resolverTypes'

export type RemoveMultipleOrgUsersSuccessSource = {
  orgId: string
  teamIds: string[]
  teamMemberIds: string[]
  taskIds: string[]
  userIds: string[]
  kickOutNotificationIds: string[]
  organizationUserIds: string[]
}

const RemoveMultipleOrgUsersSuccess: RemoveMultipleOrgUsersSuccessResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return await dataLoader.get('organizations').loadNonNull(orgId)
  },
  teams: async ({teamIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('teams').loadMany(teamIds)).filter(isValid)
  },
  teamMembers: async ({teamMemberIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('teamMembers').loadMany(teamMemberIds)).filter(isValid)
  },
  updatedTasks: async ({taskIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('tasks').loadMany(taskIds)).filter(isValid)
  },
  users: async ({userIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
  },
  kickOutNotifications: async ({kickOutNotificationIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('notifications').loadMany(kickOutNotificationIds)).filter(
      isValid
    ) as KickedOutNotification[]
  },
  removedOrgMembers: async ({organizationUserIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('organizationUsers').loadMany(organizationUserIds)).filter(isValid)
  }
}

export default RemoveMultipleOrgUsersSuccess
