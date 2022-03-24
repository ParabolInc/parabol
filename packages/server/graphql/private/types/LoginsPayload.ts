import authCount from '../queries/helpers/authCount'
import authCountByDomain from '../queries/helpers/authCountByDomain'
import {LoginsPayloadResolvers} from '../resolverTypes'

export type LoginsPayloadSource = {
  after?: Date | null
  isActive: boolean
}

const LoginsPayload: LoginsPayloadResolvers = {
  total: async ({after, isActive}) => {
    return authCount(after, isActive, 'lastSeenAt')
  },
  byDomain: async ({after, isActive}) => {
    return authCountByDomain(after, isActive, 'lastSeenAt')
  }
}

export default LoginsPayload
