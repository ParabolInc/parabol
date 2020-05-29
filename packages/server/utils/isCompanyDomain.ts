const GENERIC_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'parabol.co',
  'googlemail.com',
  'hotmail.com',
  'outlook.com',
  'mail.com'
])

const isCompanyDomain = (domain: string) => !GENERIC_DOMAINS.has(domain)

export default isCompanyDomain
