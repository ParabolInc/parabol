import type {UserTiersCountResolvers} from '../resolverTypes'

export type UserTiersCountSource = {
  tierStarterCount: number
  tierTeamCount: number
  tierTeamBillingLeaderCount: number
  userId?: string
}

const UserTiersCount: UserTiersCountResolvers = {
  user: ({userId}, _args, {dataLoader}) => {
    return userId ? dataLoader.get('users').loadNonNull(userId) : null
  }
}

export default UserTiersCount
