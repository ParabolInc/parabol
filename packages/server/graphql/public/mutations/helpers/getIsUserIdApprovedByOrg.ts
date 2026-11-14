import createEmailVerficationForExistingUser from '../../../../email/createEmailVerficationForExistingUser'
import type {DataLoaderWorker} from '../../../graphql'
import type {UserErrorCode} from '../../resolverTypes'
import {getIsEmailApprovedByOrg} from './getIsEmailApprovedByOrg'

export class OrgApprovalError extends Error {
  readonly code: UserErrorCode
  constructor(code: UserErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

export const getIsUserIdApprovedByOrg = async (
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
    const {name: orgName} = await dataLoader.get('organizations').loadNonNull(orgId)
    const message = `${email} is not on ${orgName}'s approved list of users. Please reach out to your account admin or support@parabol.co for more information`
    return new OrgApprovalError('NOT_APPROVED', message)
  }
  const isEmailUnverified = identities.some((identity) => !identity.isEmailVerified)
  if (isEmailUnverified) {
    if (!invitationToken)
      return new OrgApprovalError('EMAIL_VERIFICATION_REQUIRED', 'Email not verified')
    const emailError = await createEmailVerficationForExistingUser(
      userId,
      invitationToken,
      dataLoader
    )
    return new OrgApprovalError(
      'EMAIL_VERIFICATION_REQUIRED',
      emailError?.message ?? 'You must verify your email to join. Check your email'
    )
  }
  return undefined
}
