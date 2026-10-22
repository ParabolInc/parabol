import {normalizeInviteeEmail} from '../shared/teamInviteeEmail'

// Pulls the addresses out of typed or pasted text: lists separated by commas, semicolons, spaces or
// newlines, spreadsheet columns, and "Name <email>" entries copied from Gmail or Outlook
const splitEmailList = (text: string) => {
  const tokens = text
    // quoted display names can contain separators, e.g. "Doe, Jane" <jane@example.com>
    .replace(/"[^"]*"/g, ' ')
    .split(/[\s,;<>]+/)
    .map((token) =>
      normalizeInviteeEmail(token.replace(/^mailto:/i, '').replace(/^[([']+|[)\]'.:]+$/g, ''))
    )
    .filter(Boolean)
  // Names next to addresses are noise, but a lone word without an @ is a typo worth flagging
  const hasAddress = tokens.some((token) => token.includes('@'))
  const emails = hasAddress ? tokens.filter((token) => token.includes('@')) : tokens
  return Array.from(new Set(emails))
}

export default splitEmailList
