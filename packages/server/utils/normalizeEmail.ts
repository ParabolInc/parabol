// Strips null bytes (0x00), which Postgres cannot encode as UTF8 and would throw on,
// then lowercases and trims whitespace to canonicalize the address.
const normalizeEmail = (email: string) => {
  return email.replace(/\0/g, '').toLowerCase().trim()
}

export default normalizeEmail
