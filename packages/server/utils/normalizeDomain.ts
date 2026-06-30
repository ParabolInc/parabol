// Strips null bytes (0x00), which Postgres cannot encode as UTF8 and would throw on,
// then lowercases and trims whitespace to canonicalize the domain.
const normalizeDomain = (domain: string) => {
  return domain.replace(/\0/g, '').toLowerCase().trim()
}

export default normalizeDomain
