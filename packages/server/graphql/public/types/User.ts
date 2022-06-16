import {isNotNull} from 'parabol-client/utils/predicates'
import {isSuperUser} from '../../../utils/authorization'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import getVerifiedUserDomain from '../../../utils/getVerifiedUserDomain'
import isCompanyDomain from '../../../utils/isCompanyDomain'
import {UserResolvers} from '../resolverTypes'

const User: UserResolvers = {
  company: async ({email}, _args, {authToken}) => {
    const domain = getDomainFromEmail(email)
    if (!domain || !isCompanyDomain(domain) || !isSuperUser(authToken)) return null
    return {id: domain}
  },
  domains: async ({id: userId}, _args, {dataLoader}) => {
    const [organizationUsers, userDomain] = await Promise.all([
      dataLoader.get('organizationUsersByUserId').load(userId),
      getVerifiedUserDomain(userId, dataLoader)
    ])
    const orgIds = organizationUsers
      .filter(({suggestedTier}) => suggestedTier && suggestedTier !== 'personal')
      .map(({orgId}) => orgId)

    const organizations = await Promise.all(
      orgIds.map((orgId) => dataLoader.get('organizations').load(orgId))
    )
    const approvedDomains = organizations
      .map(({activeDomain}) => activeDomain)
      .concat(userDomain!)
      .filter(isNotNull)
    return [...new Set(approvedDomains)].map((id) => ({id}))
  },
  featureFlags: ({featureFlags}) => {
    return Object.fromEntries(featureFlags.map((flag) => [flag as any, true]))
  }
}

export default User
