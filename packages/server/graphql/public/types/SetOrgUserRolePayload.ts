import {getUserId} from '../../../utils/authorization'
import isValid from '../../isValid'
import type {SetOrgUserRolePayloadResolvers} from '../resolverTypes'

export type SetOrgUserRolePayloadSource = {
  orgId: string
  organizationUserId: string
  notificationIdsAdded: string[]
}

const SetOrgUserRolePayload: SetOrgUserRolePayloadResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  },
  updatedOrgMember: async ({organizationUserId}, _args, {dataLoader}) => {
    return dataLoader.get('organizationUsers').loadNonNull(organizationUserId)
  },
  notificationsAdded: async ({notificationIdsAdded}, _args, {authToken, dataLoader}) => {
    if (!notificationIdsAdded.length) return []
    const viewerId = getUserId(authToken)
    const notifications = (
      await dataLoader.get('notifications').loadMany(notificationIdsAdded)
    ).filter(isValid)
    return notifications.filter((notification) => notification.userId === viewerId)
  }
}

export default SetOrgUserRolePayload
