import type {UserLogInPayloadResolvers} from '../resolverTypes'

export type UserLogInPayloadSource = {
  userId: string
  isNewUser: boolean
}

const UserLogInPayload: UserLogInPayloadResolvers = {
  user: ({userId}, _args, {dataLoader}) => dataLoader.get('users').loadNonNull(userId),
  userErrors: () => []
}

export default UserLogInPayload
