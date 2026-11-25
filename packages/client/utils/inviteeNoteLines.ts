import type {InviteeDraft, InviteeNote} from '../hooks/useTeamInviteeDrafts'
import {isValidEmail} from '../shared/emailAddress'
import {checkInviteeEmail, type InviteeDirectory, NEW_TO_PARABOL_MESSAGE} from './inviteeDirectory'

export type InviteeNoteLine = {key: string; lead: string; message: string}
type NoteKind = 'newToParabol' | 'outsideOrg'

const GROUP_MIN_COUNT = 3

const getGroupMessage = (kind: NoteKind, orgName: string) =>
  kind === 'newToParabol'
    ? "aren't on Parabol yet and will get an email invite."
    : `are outside ${orgName} and will get an email invite.`

const getInviteeNoteLines = (
  drafts: readonly InviteeDraft[],
  notes: readonly InviteeNote[],
  directory: InviteeDirectory | null
): InviteeNoteLine[] => {
  const serverLines = notes.map(({email, message}) => ({key: email, lead: email, message}))
  if (!directory) return serverLines
  const noteEmails = new Set(notes.map(({email}) => email))
  const entries = drafts.flatMap(({email, rejection}) => {
    if (rejection || noteEmails.has(email) || !isValidEmail(email)) return []
    const check = checkInviteeEmail(email, directory)
    if (check.kind === 'closeToMember') {
      return {email, kind: 'newToParabol' as const, message: NEW_TO_PARABOL_MESSAGE}
    }
    return check.kind === 'newToParabol' || check.kind === 'outsideOrg'
      ? {email, kind: check.kind, message: check.message}
      : []
  })
  const countByKind = new Map<NoteKind, number>()
  entries.forEach(({kind}) => countByKind.set(kind, (countByKind.get(kind) ?? 0) + 1))
  const groupedKinds = new Set<NoteKind>()
  const checkLines = entries.flatMap(({email, kind, message}) => {
    const count = countByKind.get(kind) ?? 0
    if (count < GROUP_MIN_COUNT) return {key: email, lead: email, message}
    if (groupedKinds.has(kind)) return []
    groupedKinds.add(kind)
    return {
      key: kind,
      lead: `${count} addresses`,
      message: getGroupMessage(kind, directory.orgName)
    }
  })
  return [...serverLines, ...checkLines]
}

export default getInviteeNoteLines
