import type {UserError, UserLogInPayloadResolvers} from '../resolverTypes'

export type UserLogInPayloadSource =
  | {
      userId: string
      isNewUser: boolean
    }
  | {userErrors: UserError[]}

const UserLogInPayload: UserLogInPayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    if ('userErrors' in source) return null
    const {userId} = source
    return dataLoader.get('users').loadNonNull(userId)
  },
  userErrors: (source) => ('userErrors' in source ? source.userErrors : [])
}

export default UserLogInPayload
