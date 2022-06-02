import {OrganizationUserResolvers} from '../resolverTypes'

const OrganizationUser: OrganizationUserResolvers = {
  allowInsights: ({allowInsights}) => !!allowInsights
}

export default OrganizationUser
