import plural from '../utils/plural'

// An approval is an exact domain, a wildcard like *.example.com (which also covers example.com), or a single address
export const isEmailOnApprovedList = (email: string, approvedDomains: readonly string[]) => {
  const normalizedEmail = email.toLowerCase()
  const exactDomain = normalizedEmail.slice(normalizedEmail.indexOf('@') + 1)
  return approvedDomains.some((approvedDomain) => {
    if (approvedDomain === exactDomain || approvedDomain === normalizedEmail) return true
    if (!approvedDomain.startsWith('*.')) return false
    const baseDomain = approvedDomain.slice(2)
    return exactDomain === baseDomain || exactDomain.endsWith(`.${baseDomain}`)
  })
}

export const formatApprovedList = (approvedDomains: readonly string[]) => {
  const shown = approvedDomains.slice(0, 3)
  const hiddenCount = approvedDomains.length - shown.length
  if (hiddenCount > 0) {
    return `${shown.join(', ')}, or ${hiddenCount} other ${plural(hiddenCount, 'domain')}`
  }
  if (shown.length === 1) return shown[0]!
  return `${shown.slice(0, -1).join(', ')} or ${shown.at(-1)}`
}
