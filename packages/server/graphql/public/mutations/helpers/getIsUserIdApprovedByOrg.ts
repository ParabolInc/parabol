import createEmailVerficationForExistingUser from '../../../../email/createEmailVerficationForExistingUser'
import {DataLoaderWorker} from '../../../graphql'
import getIsEmailApprovedByOrg from './getIsEmailApprovedByOrg'
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
  const maybeError = await getIsEmailApprovedByOrg(email, orgId, dataLoader)
  if (maybeError) {
    const message = `Your email is not on your company's approved list of users. Please reach out to your account admin or support@parabol.co for more information`
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
