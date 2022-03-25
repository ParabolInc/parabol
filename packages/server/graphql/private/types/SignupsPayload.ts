import authCount from '../queries/helpers/authCount'
import authCountByDomain from '../queries/helpers/authCountByDomain'
import {SignupsPayloadResolvers} from '../resolverTypes'

export type SignupsPayloadSource = {
  after?: Date | null
  isActive: boolean
}

const SignupsPayload: SignupsPayloadResolvers = {
  total: async ({after, isActive}) => {
    return authCount(after, isActive, 'createdAt')
  },

  byDomain: async ({after, isActive}) => {
    return authCountByDomain(after, isActive, 'createdAt')
  }
}

export default SignupsPayload
