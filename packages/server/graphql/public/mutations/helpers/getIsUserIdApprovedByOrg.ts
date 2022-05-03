import createEmailVerficationForExistingUser from '../../../../email/createEmailVerficationForExistingUser'
import {DataLoaderWorker} from '../../../graphql'
const getIsUserIdApprovedByOrg = async (
  userId: string,
  orgId: string,
  dataLoader: DataLoaderWorker,
  invitationToken?: string
) => {
  const approvedDomains = await dataLoader.get('organizationApprovedDomainsByOrgId').load(orgId)
  if (approvedDomains.length === 0) return undefined
  const organizationUser = await dataLoader
    .get('organizationUsersByUserIdOrgId')
    .load({userId, orgId})
  // if they're in the organization, no approval needed
  if (organizationUser) return undefined
  const user = await dataLoader.get('users').loadNonNull(userId)
  const {email, identities} = user
  const isApproved = approvedDomains.some((domain) => email.endsWith(domain))
  if (!isApproved) {
    const domainList = approvedDomains.join(', ')
    const message = `Cannot accept invitation. Your email must end with ${domainList}`
    return new Error(message)
  }
  const isEmailUnverified = identities.some((identity) => !identity.isEmailVerified)
  if (isEmailUnverified) {
    if (!invitationToken) return new Error('Email not verified')
    const emailError = await createEmailVerficationForExistingUser(
      userId,
      invitationToken,
      dataLoader
    )
    return emailError || new Error('You must verify your email to join. Check your email')
  }
  return undefined
}

export default getIsUserIdApprovedByOrg
