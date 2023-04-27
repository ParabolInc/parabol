import {UserLogInPayloadResolvers} from '../resolverTypes'

export type UserLogInPayloadSource =
  | {
      userId: string
      authToken: string
      isNewUser: boolean
    }
  | {error: {message: string}}

const UserLogInPayload: UserLogInPayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {userId} = source
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default UserLogInPayload
