import {Close, Error as ErrorIcon, MailOutline} from '~/ui/icons'
import {cn} from '../ui/cn'
import InviteeAvatar from './InviteeField/InviteeAvatar'

interface Props {
  email: string
  person?: {name: string; picture: string}
  showMailIcon?: boolean
  hasProblem: boolean
  onRemove: (email: string) => void
}

const TeamInviteeChip = (props: Props) => {
  const {email, person, showMailIcon, hasProblem, onRemove} = props
  const label = person?.name ?? email
  return (
    <li
      title={person ? email : undefined}
      className={cn(
        'flex h-7 max-w-full items-center gap-1 rounded-sm bg-surface-well pr-0.5 pl-2 font-semibold text-fg-primary text-sm ring-1 ring-inset',
        hasProblem ? 'ring-fg-error' : 'ring-hairline-strong',
        person && !hasProblem && 'gap-1.5 pl-[3px]'
      )}
    >
      {hasProblem ? (
        <ErrorIcon className='text-base text-fg-error' />
      ) : person ? (
        <InviteeAvatar
          name={person.name}
          picture={person.picture}
          className='size-[22px] text-[9px]'
        />
      ) : (
        showMailIcon && <MailOutline className='text-base text-fg-secondary' />
      )}
      <span className='truncate'>{label}</span>
      {person && <span className='sr-only'>{` ${email}`}</span>}
      {hasProblem && <span className='sr-only'>(needs attention)</span>}
      <button
        type='button'
        aria-label={`Remove ${label}`}
        onClick={() => onRemove(email)}
        className='flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-fg-secondary hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent'
      >
        <Close className='text-base' />
      </button>
    </li>
  )
}

export default TeamInviteeChip
