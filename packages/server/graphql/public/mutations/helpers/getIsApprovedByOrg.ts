import {DataLoaderWorker} from '../../../graphql'

interface BaseParams {
  orgId: string
  dataLoader: DataLoaderWorker
}

// only pass in email if a user has not been created yet
type GetIsApprovedParams = BaseParams & ({email: string} | {userId: string})

const getIsApprovedByOrg = async (params: GetIsApprovedParams) => {
  const {dataLoader, orgId} = params
  const approvedDomains = await dataLoader.get('organizationApprovedDomains').load(orgId)
  if (approvedDomains.length === 0) return undefined
  if ('userId' in params) {
    const {userId} = params
    const organizationUser = await dataLoader
      .get('organizationUsersByUserIdOrgId')
      .load({userId, orgId})
    // if they're in the organization, no approval needed
    if (organizationUser) return undefined
    const user = await dataLoader.get('users').loadNonNull(userId)
    const {email, identities} = user
    const isApproved = approvedDomains.some((domain) => email.endsWith(domain))
    if (!isApproved) {
      const isSingular = approvedDomains.length === 1
      const message = `Your email must end with ${
        isSingular ? '' : 'one of '
      }the following : ${approvedDomains.join(', ')}`
      return new Error(message)
    }
    const isEmailUnverified = identities.some((identity) => !identity.isEmailVerified)
    if (isEmailUnverified) {
      return new Error('You must verify your email to join. Check your email')
    }
  } else {
    const {email} = params
    const domain = email.split('@')[1]
    const [restrictedEmail, restrictedDomain] = await Promise.all([
      dataLoader.get('restrictedEmailDomains').load(email),
      dataLoader.get('restrictedEmailDomains').load(domain)
    ])
    if (restrictedDomain || restrictedEmail) {
      return new Error('You must verify your email to join. Check your email')
    }
  }
  return undefined
}

export default getIsApprovedByOrg
