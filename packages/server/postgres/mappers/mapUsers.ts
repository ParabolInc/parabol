import User from '../../database/types/User'
import {IInsertUserQueryParams} from '../queries/generated/insertUserQuery'

const undefinedUserFieldsAndTheirDefaultPgValues = {
  newFeatureId: null,
  overLimitCopy: null,
  isRemoved: false,
  segmentId: null,
  reasonRemoved: null,
  rol: null,
  payLaterClickCount: 0
}

const keyValues = Object.entries(
  undefinedUserFieldsAndTheirDefaultPgValues
)

const mapUsers = (users: User[]): IInsertUserQueryParams['users'] => {
  const mappedUsers = [] as any
  users.forEach(user => {
    const mappedUser = Object.assign({}, user)
    keyValues.forEach(([k, v]) => {
      mappedUser[k] = user.hasOwnProperty(k) ? user[k] : v
    })
    mappedUsers.push(mappedUser)
  })
  return mappedUsers
}

export default mapUsers
