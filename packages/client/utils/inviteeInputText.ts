const SEPARATOR_CHARS = '\\s,;<>'
export const INVITEE_SEPARATOR = new RegExp(`[${SEPARATOR_CHARS}]`)
const LAST_SEPARATOR = new RegExp(`[${SEPARATOR_CHARS}][^${SEPARATOR_CHARS}]*$`)
const TRAILING_SEPARATORS = new RegExp(`[${SEPARATOR_CHARS}]+$`)

export const splitTypedInvitees = (value: string, hasDirectory: boolean) => {
  const separatorIdx = value.search(LAST_SEPARATOR)
  if (separatorIdx === -1) return {commit: null, rest: value}
  const commit = value.slice(0, separatorIdx).replace(TRAILING_SEPARATORS, '')
  if (hasDirectory && !commit.includes('@')) return {commit: null, rest: value}
  return {commit: commit || null, rest: value.slice(separatorIdx + 1)}
}
