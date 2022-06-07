import {DataLoaderWorker} from '../graphql/graphql'

const isEmailVerificationRequired = async (email: string, dataLoader: DataLoaderWorker) => {
  const domain = email.split('@')[1]!
  const [approvedEmail, approvedDomain] = await Promise.all([
    dataLoader.get('organizationApprovedDomains').load(email),
    dataLoader.get('organizationApprovedDomains').load(domain)
  ])
  return approvedEmail || approvedDomain
}

export default isEmailVerificationRequired
