import User from '../../database/types/User'
import {IInsertUserQueryParams} from '../queries/generated/insertUserQuery'
import getDeletedEmail from '../../utils/getDeletedEmail'

const undefinedUserFieldsAndTheirDefaultPgValues = {
  newFeatureId: null,
  overLimitCopy: null,
  isRemoved: false,
  segmentId: null,
  reasonRemoved: null,
  rol: null,
  payLaterClickCount: 0,
  featureFlags: [],
  inactive: false
}

const mapUsers = (users: User[]): IInsertUserQueryParams['users'] => {
  const mappedUsers = [] as any
  users.forEach(user => {
    const mappedUser = Object.assign(
      {},
      undefinedUserFieldsAndTheirDefaultPgValues,
      user,
      {
        email: user.email === 'DELETED' ?
          getDeletedEmail(user.id)
          :
          user.email.slice(0, 500),
        preferredName: user.preferredName.slice(0, 100),
      }
    ) as IInsertUserQueryParams['users'][0]
    if ((mappedUser.email as string).length === 500) { return }
    mappedUsers.push(mappedUser)
  })
  return mappedUsers
}

export default mapUsers
