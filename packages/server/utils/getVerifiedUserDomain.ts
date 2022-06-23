import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import getRethink from '../database/rethinkDriver'
import {DataLoaderWorker} from '../graphql/graphql'
import isCompanyDomain from './isCompanyDomain'

// A user can only see a domain that the have access to
// Access can be granted 1 of 2 ways:
// 1. We give them access manually, but putting "suggestedTier" on their OrganizationUser
// 2. Their email is verified & the domain they want to access is registered to their email

const getVerifiedUserDomain = async (userId: string, dataLoader: DataLoaderWorker) => {
  const user = await dataLoader.get('users').loadNonNull(userId)
  const {identities, email} = user
  const domain = getSSODomainFromEmail(email)
  if (!domain || isCompanyDomain(domain)) return null
  const isVerified = identities.some((auth) => auth.isEmailVerified)
  if (isVerified) return domain
  // SAML isn't stored as an identity, so check independently
  const r = await getRethink()
  const isSAMLVerified = await r
    .table('SAML')
    .getAll(domain, {index: 'domains'})
    .limit(1)
    .count()
    .eq(1)
    .run()
  return isSAMLVerified ? domain : null
}

export default getVerifiedUserDomain
