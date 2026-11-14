import {useState} from 'react'
import type {useInviteToTeamMutation$data} from '../__generated__/useInviteToTeamMutation.graphql'
import {isValidEmail} from '../shared/emailAddress'
import splitEmailList from '../utils/splitEmailList'

export type TeamInviteeResult = useInviteToTeamMutation$data['inviteToTeam']['invitees'][number]

export type InviteeDraft = {
  email: string
  rejection: {
    status: TeamInviteeResult['status']
    message: string
    suggestedEmail: string | null
  } | null
}

// an address that needs no action, like someone already on the team
export type InviteeNote = {email: string; message: string}

export const isDraftReady = ({email, rejection}: InviteeDraft) => !rejection && isValidEmail(email)

const NOTE_STATUSES: TeamInviteeResult['status'][] = ['alreadyOnTeam', 'alreadyInvited']

export const isRejected = ({status}: TeamInviteeResult) =>
  status !== 'sent' && !NOTE_STATUSES.includes(status)

const toRejectedDraft = (result: TeamInviteeResult): InviteeDraft => ({
  email: result.email,
  rejection: {
    status: result.status,
    message: result.message ?? '',
    suggestedEmail: result.suggestedEmail ?? null
  }
})

const toNotes = (results: readonly TeamInviteeResult[]) =>
  results
    .filter(({status}) => NOTE_STATUSES.includes(status))
    .map(({email, message}) => ({email, message: message ?? ''}))

const toSentEmails = (results: readonly TeamInviteeResult[]) =>
  results.filter(({status}) => status === 'sent').map(({email}) => email)

const useTeamInviteeDrafts = (
  teamEmails: readonly string[],
  initialResults: readonly TeamInviteeResult[] = []
) => {
  const [inputValue, setInputValue] = useState('')
  const [drafts, setDrafts] = useState(() => initialResults.filter(isRejected).map(toRejectedDraft))
  const [notes, setNotes] = useState(() => toNotes(initialResults))
  const [sentEmails, setSentEmails] = useState(() => toSentEmails(initialResults))
  const teamEmailSet = new Set(teamEmails)
  const draftEmailSet = new Set(drafts.map(({email}) => email))
  const isNewEmail = (email: string) => !draftEmailSet.has(email) && !teamEmailSet.has(email)
  const pendingEmails = splitEmailList(inputValue).filter(
    (email) => isValidEmail(email) && isNewEmail(email)
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

  const commitText = (text: string) => {
    addEmails(text)
    setInputValue('')
  }

  const commitInput = () => {
    setInputValue('')
    return inputValue.trim() ? addEmails(inputValue) : drafts
  }

  const removeEmails = (emails: readonly string[]) => {
    setDrafts((current) => current.filter((draft) => !emails.includes(draft.email)))
  }

  const removeDraft = (email: string) => removeEmails([email])

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

  const applyResults = (results: readonly TeamInviteeResult[]) => {
    const resultByEmail = new Map(results.map((result) => [result.email, result]))
    setDrafts((current) =>
      current.flatMap((draft) => {
        const result = resultByEmail.get(draft.email)
        if (!result) return [draft]
        return isRejected(result) ? [toRejectedDraft(result)] : []
      })
    )
    setNotes(toNotes(results))
    const newlySent = toSentEmails(results)
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
    commitText,
    commitInput,
    removeEmails,
    removeDraft,
    editDraft,
    retryDraft,
    replaceDraft,
    applyResults
  }
}

export default useTeamInviteeDrafts
