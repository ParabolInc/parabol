export const MAX_TEAM_INVITEES = 50

// Stricter than RFC 5322 on purpose: quoted local parts and display names are never needed for an
// invitation, and the characters they allow (commas, semicolons, angle brackets, quotes) can smuggle
// extra recipients into a mail header
const INVITEE_EMAIL = /^[^\s@,;:<>()[\]\\"]+@[^\s@,;:<>()[\]\\".]+(?:\.[^\s@,;:<>()[\]\\".]+)+$/

export const normalizeInviteeEmail = (email: string) => email.trim().toLowerCase()

export const isValidInviteeEmail = (email: string) =>
  email.length <= 254 && INVITEE_EMAIL.test(email)
