const GENERIC_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'parabol.co',
  'googlemail.com',
  'hotmail.com',
  'outlook.com',
  'mail.com'
]

const isCompanyDomain = (domain: string) => !GENERIC_DOMAINS.includes(domain)

export default isCompanyDomain
