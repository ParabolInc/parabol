import authCount from '../../intranetSchema/queries/helpers/authCount'
import authCountByDomain from '../../intranetSchema/queries/helpers/authCountByDomain'
import {LoginsPayloadResolvers} from '../resolverTypes'

export interface LoginsPayloadSource {
  after?: Date
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
