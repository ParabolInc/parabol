import {SetOrgUserRoleSuccessResolvers} from '../resolverTypes'
import {getUserId} from '../../../utils/authorization'
import errorFilter from '../../errorFilter'

export type SetOrgUserRoleSuccessSource = {
  orgId: string
  organizationUserId: string
  notificationIdsAdded: string[]
}

const SetOrgUserRoleSuccess: SetOrgUserRoleSuccessResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').load(orgId)
  },
  updatedOrgMember: async ({organizationUserId}, _args, {dataLoader}) => {
    return dataLoader.get('organizationUsers').load(organizationUserId)
  },
  notificationsAdded: async ({notificationIdsAdded}, _args, {authToken, dataLoader}) => {
    if (!notificationIdsAdded.length) return []
    const viewerId = getUserId(authToken)
    const notifications = (
      await dataLoader.get('notifications').loadMany(notificationIdsAdded)
    ).filter(errorFilter)
    return notifications.filter((notification) => notification.userId === viewerId)
  }
}

export default SetOrgUserRoleSuccess
