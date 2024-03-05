import {DataLoaderWorker} from '../graphql/graphql'

const isEmailVerificationRequired = async (email: string, dataLoader: DataLoaderWorker) => {
  const exactDomain = email.split('@')[1]!

  // search for wildcards, too
  const [tld, domain] = exactDomain.split('.').reverse()
  const wildcardDomain = `*.${domain}.${tld}`

  const [approvedEmail, approvedDomain, approvedWildcardDomain] = await Promise.all([
    dataLoader.get('organizationApprovedDomains').load(email),
    dataLoader.get('organizationApprovedDomains').load(exactDomain),
    dataLoader.get('organizationApprovedDomains').load(wildcardDomain)
  ])
  return approvedEmail || approvedDomain || approvedWildcardDomain
}

export default isEmailVerificationRequired
