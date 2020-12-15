const getSSODomainFromEmail = (email) => {
  const [, domainWithTld] = email.toLowerCase().split('@')
  if (!domainWithTld) return null
  const lastDotIdx = domainWithTld.lastIndexOf('.')
  const lastSafeDotIdx = lastDotIdx === -1 ? 1e6 : lastDotIdx
  return domainWithTld.slice(0, lastSafeDotIdx)
}

export default getSSODomainFromEmail
