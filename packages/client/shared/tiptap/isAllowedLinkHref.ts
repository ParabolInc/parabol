const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

export const isAllowedLinkHref = (href: unknown) => {
  if (typeof href !== 'string') return false
  try {
    return ALLOWED_LINK_PROTOCOLS.has(new URL(href).protocol)
  } catch {
    return false
  }
}
