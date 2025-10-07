import AuthToken from '../../../database/types/AuthToken'
import type {UserLogInPayloadResolvers} from '../resolverTypes'

export type UserLogInPayloadSource =
  | {
      userId: string
      role: AuthToken['rol']
      isNewUser: boolean
    }
  | {error: {message: string}}

const UserLogInPayload: UserLogInPayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {userId} = source
    return dataLoader.get('users').loadNonNull(userId)
  },
  role: (source) => {
    if ('error' in source) return null
    const {role} = source
    switch (role) {
      case 'su':
        return 'SU'
      case 'impersonate':
        return 'IMPERSONATE'
      default:
        return null
    }
  }
}

export default UserLogInPayload
