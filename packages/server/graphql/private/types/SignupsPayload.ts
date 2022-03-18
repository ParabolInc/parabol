import authCount from "../../intranetSchema/queries/helpers/authCount"
import authCountByDomain from "../../intranetSchema/queries/helpers/authCountByDomain"
import { SignupsPayloadResolvers } from '../resolverTypes'

export type SignupsPayloadSource = any

const SignupsPayload: SignupsPayloadResolvers = {
    total: async ({after, isActive}) => {
      return authCount(after, isActive, 'createdAt')
    },

    byDomain: async ({after, isActive}) => {
      return authCountByDomain(after, isActive, 'createdAt')
    }
}

export default SignupsPayload