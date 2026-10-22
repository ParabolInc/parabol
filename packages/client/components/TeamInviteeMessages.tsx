import {Error as ErrorIcon, Info} from '~/ui/icons'
import type {InviteeDraft, InviteeNote} from '../hooks/useTeamInviteeDrafts'
import {isValidEmail} from '../shared/emailAddress'

interface Props {
  id: string
  drafts: InviteeDraft[]
  notes: InviteeNote[]
  onEdit: (email: string) => void
  onRetry: (email: string) => void
  onReplace: (email: string, nextEmail: string) => void
}

const TeamInviteeMessages = (props: Props) => {
  const {id, drafts, notes, onEdit, onRetry, onReplace} = props
  const problems = drafts.flatMap(({email, rejection}) => {
    if (rejection) return {email, ...rejection}
    if (isValidEmail(email)) return []
    return {email, status: 'invalid', message: 'Not a valid email address.', suggestedEmail: null}
  })
  return (
    <ul id={id} aria-live='polite' className='m-0 list-none p-0'>
      {problems.map(({email, status, message, suggestedEmail}) => {
        const [actionLabel, onAction] = suggestedEmail
          ? [`Use ${suggestedEmail}`, () => onReplace(email, suggestedEmail)]
          : status === 'sendFailed'
            ? ['Try again', () => onRetry(email)]
            : ['Edit address', () => onEdit(email)]
        return (
          <li key={email} className='mt-2 flex items-start gap-2 text-sm leading-5'>
            <ErrorIcon className='mt-px shrink-0 text-fg-error text-lg' />
            <div className='wrap-anywhere min-w-0 text-fg-primary'>
              <span className='font-semibold'>{email}</span> {message}
              <button
                type='button'
                onClick={onAction}
                className='mt-0.5 block cursor-pointer border-0 bg-transparent p-0 text-left font-semibold text-fg-primary text-sm underline underline-offset-2 hover:text-accent'
              >
                {actionLabel}
              </button>
            </div>
          </li>
        )
      })}
      {notes.map(({email, message}) => (
        <li key={email} className='mt-2 flex items-start gap-2 text-fg-secondary text-sm leading-5'>
          <Info className='mt-px shrink-0 text-lg' />
          <span className='wrap-anywhere min-w-0'>
            <span className='font-semibold text-fg-primary'>{email}</span> {message}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default TeamInviteeMessages
