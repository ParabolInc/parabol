import {useState} from 'react'
import type {useInviteToTeamMutation$data} from '../__generated__/useInviteToTeamMutation.graphql'
import {isValidInviteeEmail} from '../shared/teamInviteeEmail'
import splitEmailList from '../utils/splitEmailList'

type TeamInvitee = useInviteToTeamMutation$data['inviteToTeam']['invitees'][number]

export type InviteeDraft = {
  email: string
  rejection: {status: TeamInvitee['status']; message: string; suggestedEmail: string | null} | null
}

// an address that needs no action, like someone already on the team
export type InviteeNote = {email: string; message: string}

export const isDraftReady = ({email, rejection}: InviteeDraft) =>
  !rejection && isValidInviteeEmail(email)

const SETTLED_STATUSES: TeamInvitee['status'][] = ['sent', 'alreadyOnTeam', 'alreadyInvited']

const useTeamInviteeDrafts = (teamEmails: readonly string[]) => {
  const [inputValue, setInputValue] = useState('')
  const [drafts, setDrafts] = useState<InviteeDraft[]>([])
  const [notes, setNotes] = useState<InviteeNote[]>([])
  const [sentEmails, setSentEmails] = useState<string[]>([])
  const teamEmailSet = new Set(teamEmails)
  const draftEmailSet = new Set(drafts.map(({email}) => email))
  const isNewEmail = (email: string) => !draftEmailSet.has(email) && !teamEmailSet.has(email)
  const pendingEmails = splitEmailList(inputValue).filter(
    (email) => isValidInviteeEmail(email) && isNewEmail(email)
  )
  const readyEmails = [...drafts.filter(isDraftReady).map(({email}) => email), ...pendingEmails]

  const addEmails = (text: string) => {
    const emails = splitEmailList(text).filter((email) => !draftEmailSet.has(email))
    const memberEmails = emails.filter((email) => teamEmailSet.has(email))
    const nextDrafts = [
      ...drafts,
      ...emails
        .filter((email) => !teamEmailSet.has(email))
        .map((email) => ({email, rejection: null}))
    ]
    setDrafts(nextDrafts)
    if (memberEmails.length > 0) {
      setNotes((current) => [
        ...current.filter(({email}) => !memberEmails.includes(email)),
        ...memberEmails.map((email) => ({email, message: 'Already on this team.'}))
      ])
    }
    return nextDrafts
  }

  const commitInput = () => {
    setInputValue('')
    return inputValue.trim() ? addEmails(inputValue) : drafts
  }

  const removeDraft = (email: string) => {
    setDrafts((current) => current.filter((draft) => draft.email !== email))
  }

  const editDraft = (email: string) => {
    const committedDrafts = inputValue.trim() ? addEmails(inputValue) : drafts
    setDrafts(committedDrafts.filter((draft) => draft.email !== email))
    setInputValue(email)
  }

  const retryDraft = (email: string) => {
    setDrafts((current) =>
      current.map((draft) => (draft.email === email ? {email, rejection: null} : draft))
    )
  }

  const replaceDraft = (email: string, nextEmail: string) => {
    setDrafts((current) =>
      current.some((draft) => draft.email === nextEmail)
        ? current.filter((draft) => draft.email !== email)
        : current.map((draft) =>
            draft.email === email ? {email: nextEmail, rejection: null} : draft
          )
    )
  }

  const applyResults = (invitees: readonly TeamInvitee[]) => {
    const resultByEmail = new Map(invitees.map((invitee) => [invitee.email, invitee]))
    setDrafts((current) =>
      current.flatMap((draft) => {
        const result = resultByEmail.get(draft.email)
        if (!result) return [draft]
        if (SETTLED_STATUSES.includes(result.status)) return []
        const rejection = {
          status: result.status,
          message: result.message ?? '',
          suggestedEmail: result.suggestedEmail ?? null
        }
        return [{email: draft.email, rejection}]
      })
    )
    setNotes(
      invitees
        .filter(({status}) => status === 'alreadyOnTeam' || status === 'alreadyInvited')
        .map(({email, message}) => ({email, message: message ?? ''}))
    )
    const newlySent = invitees.filter(({status}) => status === 'sent').map(({email}) => email)
    setSentEmails((current) => [
      ...current,
      ...newlySent.filter((email) => !current.includes(email))
    ])
  }

  return {
    inputValue,
    setInputValue,
    drafts,
    notes,
    sentEmails,
    readyEmails,
    addEmails,
    commitInput,
    removeDraft,
    editDraft,
    retryDraft,
    replaceDraft,
    applyResults
  }
}

export default useTeamInviteeDrafts
