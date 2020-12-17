const getSSODomainFromEmail = (email) => {
  const [, domainWithTld] = email.toLowerCase().split('@')
  return domainWithTld
}

export default getSSODomainFromEmail
