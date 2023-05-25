// import {getUserId} from '../../../utils/authorization'
// import errorFilter from '../../errorFilter'
import {SetOrgUserRoleSuccessResolvers} from '../resolverTypes'

import {getUserId} from '../../../utils/authorization'
import errorFilter from '../../errorFilter'

export type SetOrgUserRoleSuccessSource = {
  orgId: string
  userId: string
  organizationUserId: string
  notificationIdsAdded?: string[]
}

const SetOrgUserRoleSuccess: SetOrgUserRoleSuccessResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').load(orgId)
  },
  updatedOrgMember: async ({organizationUserId}, _args, {dataLoader}) => {
    return dataLoader.get('organizationUsers').load(organizationUserId)
  },
  notificationsAdded: async ({notificationIdsAdded}, _args, {authToken, dataLoader}) => {
    if (!notificationIdsAdded) return []
    const viewerId = getUserId(authToken)
    const notifications = (
      await dataLoader.get('notifications').loadMany(notificationIdsAdded)
    ).filter(errorFilter)
    return notifications.filter((notification) => notification.userId === viewerId)
  }
}

export default SetOrgUserRoleSuccess

// // For SetOrgUserRoleAddedPayload
// export type SetOrgUserRoleAddedPayloadSource = {
//   orgId: string
//   userId: string
//   organizationUserId: string
//   notificationIdsAdded: string[]
// }

// const SetOrgUserRoleAddedPayload: SetOrgUserRoleAddedPayloadResolvers = {
//   organization: async ({orgId}, _args, {dataLoader}) => {
//     console.log('in SetOrgUserRoleAddedPayload')
//     return dataLoader.get('organizations').load(orgId)
//   },
//   updatedOrgMember: async ({organizationUserId}, _args, {dataLoader}) => {
//     return dataLoader.get('organizationUsers').load(organizationUserId) as any
//   },
//   notificationsAdded: async ({notificationIdsAdded}, _args, {authToken, dataLoader}) => {
//     if (!notificationIdsAdded) return []
//     const viewerId = getUserId(authToken)
//     const notifications = (
//       await dataLoader.get('notifications').loadMany(notificationIdsAdded)
//     ).filter(errorFilter)
//     return notifications.filter((notification) => notification.userId === viewerId)
//   }
// }

// export default SetOrgUserRoleAddedPayload
