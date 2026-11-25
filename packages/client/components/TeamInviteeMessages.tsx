import {useMemo} from 'react'
import {Info} from '~/ui/icons'
import type {InviteeDraft, InviteeNote} from '../hooks/useTeamInviteeDrafts'
import {isValidEmail} from '../shared/emailAddress'
import type {InviteeDirectory} from '../utils/inviteeDirectory'
import getInviteeNoteLines from '../utils/inviteeNoteLines'
import TeamInviteeProblem from './TeamInviteeProblem'

interface Props {
  id: string
  drafts: InviteeDraft[]
  notes: InviteeNote[]
  directory: InviteeDirectory | null
  onEdit: (email: string) => void
  onRetry: (email: string) => void
  onReplace: (email: string, nextEmail: string) => void
  onKeep: (email: string) => void
}

const TeamInviteeMessages = (props: Props) => {
  const {id, drafts, notes, directory, onEdit, onRetry, onReplace, onKeep} = props
  const problems = drafts.flatMap(({email, rejection}) => {
    if (rejection) return {email, ...rejection}
    if (isValidEmail(email)) return []
    return {
      email,
      status: 'invalid',
      message: 'Not a valid email address.',
      suggestedEmail: null,
      suggestedName: null
    }
  })
  const noteLines = useMemo(
    () => getInviteeNoteLines(drafts, notes, directory),
    [drafts, notes, directory]
  )
  return (
    <ul id={id} aria-live='polite' className='m-0 list-none p-0'>
      {problems.map(({email, status, message, suggestedEmail, suggestedName}) => (
        <TeamInviteeProblem
          key={email}
          email={email}
          status={status}
          message={message}
          suggestedEmail={suggestedEmail}
          suggestedName={suggestedName}
          onEdit={onEdit}
          onRetry={onRetry}
          onReplace={onReplace}
          onKeep={onKeep}
        />
      ))}
      {noteLines.map(({key, lead, message}) => (
        <li key={key} className='mt-2 flex items-start gap-2 text-fg-secondary text-sm leading-5'>
          <Info className='mt-px shrink-0 text-lg' />
          <span className='wrap-anywhere min-w-0'>
            <span className='font-semibold text-fg-primary'>{lead}</span> {message}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default TeamInviteeMessages
