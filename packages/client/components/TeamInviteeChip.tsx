import {Close, Error as ErrorIcon} from '~/ui/icons'
import {cn} from '../ui/cn'

interface Props {
  email: string
  hasProblem: boolean
  onRemove: (email: string) => void
}

const TeamInviteeChip = (props: Props) => {
  const {email, hasProblem, onRemove} = props
  return (
    <li
      className={cn(
        'flex h-7 max-w-full items-center gap-1 rounded-sm bg-surface-well pr-0.5 pl-2 font-semibold text-fg-primary text-sm ring-1 ring-inset',
        hasProblem ? 'ring-fg-error' : 'ring-hairline-strong'
      )}
    >
      {hasProblem && <ErrorIcon className='text-base text-fg-error' />}
      <span className='truncate'>{email}</span>
      {hasProblem && <span className='sr-only'>(needs attention)</span>}
      <button
        type='button'
        aria-label={`Remove ${email}`}
        onClick={() => onRemove(email)}
        className='flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-fg-secondary hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent'
      >
        <Close className='text-base' />
      </button>
    </li>
  )
}

export default TeamInviteeChip
