import {Error as ErrorIcon} from '~/ui/icons'

interface Props {
  email: string
  status: string
  message: string
  suggestedEmail: string | null
  suggestedName: string | null
  onEdit: (email: string) => void
  onRetry: (email: string) => void
  onReplace: (email: string, nextEmail: string) => void
  onKeep: (email: string) => void
}

const TeamInviteeProblem = (props: Props) => {
  const {email, status, message, suggestedEmail, suggestedName} = props
  const {onEdit, onRetry, onReplace, onKeep} = props
  const actions: [string, () => void][] =
    status === 'closeToMember' && suggestedEmail
      ? [
          [`Use ${suggestedName} (${suggestedEmail})`, () => onReplace(email, suggestedEmail)],
          ['Keep it', () => onKeep(email)]
        ]
      : suggestedEmail
        ? [[`Use ${suggestedEmail}`, () => onReplace(email, suggestedEmail)]]
        : status === 'sendFailed'
          ? [['Try again', () => onRetry(email)]]
          : [['Edit address', () => onEdit(email)]]
  return (
    <li className='mt-2 flex items-start gap-2 text-sm leading-5'>
      <ErrorIcon className='mt-px shrink-0 text-fg-error text-lg' />
      <div className='wrap-anywhere min-w-0 text-fg-primary'>
        <span className='font-semibold'>{email}</span> {message}
        <div className='mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5'>
          {actions.map(([label, onAction]) => (
            <button
              key={label}
              type='button'
              onClick={onAction}
              className='cursor-pointer border-0 bg-transparent p-0 text-left font-semibold text-fg-primary text-sm underline underline-offset-2 hover:text-accent'
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </li>
  )
}

export default TeamInviteeProblem
