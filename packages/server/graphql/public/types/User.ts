import {isNotNull} from 'parabol-client/utils/predicates'
import {isSuperUser} from '../../../utils/authorization'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import isCompanyDomain from '../../../utils/isCompanyDomain'
import {UserResolvers} from '../resolverTypes'

const User: UserResolvers = {
  company: async ({email}, _args, {authToken}) => {
    const domain = getDomainFromEmail(email)
    if (!domain || !isCompanyDomain(domain) || !isSuperUser(authToken)) return null
    return {id: domain}
  },
  domains: async ({id: userId}, _args, {dataLoader}) => {
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const orgIds = organizationUsers
      .filter(({allowInsights}) => allowInsights)
      .map(({orgId}) => orgId)
    const organizations = await Promise.all(
      orgIds.map((orgId) => dataLoader.get('organizations').load(orgId))
    )
    return organizations
      .map(({activeDomain}) => activeDomain)
      .filter(isNotNull)
      .map((id) => ({id}))
  },
  featureFlags: ({featureFlags}) => {
    return Object.fromEntries(featureFlags.map((flag) => [flag as any, true]))
  }
}

export default User
