import {GraphQLError} from 'graphql'
import createEmailVerficationForExistingUser from '../../../../email/createEmailVerficationForExistingUser'
import type {DataLoaderWorker} from '../../../graphql'
import {getIsEmailApprovedByOrg} from './getIsEmailApprovedByOrg'

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
    return new GraphQLError(message, {extensions: {code: 'FORBIDDEN'}})
  }
  const isEmailUnverified = identities.some((identity) => !identity.isEmailVerified)
  if (isEmailUnverified) {
    if (!invitationToken) {
      return new GraphQLError('Email not verified', {
        extensions: {code: 'EMAIL_VERIFICATION_REQUIRED'}
      })
    }
    const emailError = await createEmailVerficationForExistingUser(
      userId,
      invitationToken,
      dataLoader
    )
    return new GraphQLError(
      emailError?.message ?? 'You must verify your email to join. Check your email',
      {extensions: {code: 'EMAIL_VERIFICATION_REQUIRED'}}
    )
  }
  return undefined
}
