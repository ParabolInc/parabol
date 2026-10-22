// Stricter than RFC 5322 on purpose: quoted local parts and display names are never needed, and the
// characters they allow (commas, semicolons, angle brackets, quotes) can smuggle extra recipients
// into a mail header
const EMAIL = /^[^\s@,;:<>()[\]\\"]+@[^\s@,;:<>()[\]\\".]+(?:\.[^\s@,;:<>()[\]\\".]+)+$/

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const isValidEmail = (email: string) => email.length <= 254 && EMAIL.test(email)
