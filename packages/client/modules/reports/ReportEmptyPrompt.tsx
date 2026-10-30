import {Link} from 'react-router'
import {ArrowForward} from '~/ui/icons'
import {Button} from '../../ui/Button/Button'
import {cn} from '../../ui/cn'

interface Props {
  title: string
  description: string
  actionLabel: string
  // where the action goes or what it does, or null while what it needs loads
  action: {to: string} | {onClick: () => void} | null
  isCompact: boolean
}

// What a report with nothing to show asks people to do first, over a sample of what they'll get
const ReportEmptyPrompt = ({title, description, actionLabel, action, isCompact}: Props) => {
  const buttonProps = {
    variant: 'primary',
    size: isCompact ? 'md' : 'lg',
    className: cn('gap-2', isCompact ? 'mt-3 px-4' : 'mt-5 px-6')
  } as const
  const label = (
    <>
      {actionLabel}
      <ArrowForward className='size-5' />
    </>
  )
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-lg border border-hairline bg-surface-raised text-center shadow-lg',
        isCompact ? 'max-w-xs p-4' : 'max-w-md p-6'
      )}
    >
      <h3 className={cn('m-0 font-semibold text-fg-primary', isCompact ? 'text-base' : 'text-lg')}>
        {title}
      </h3>
      <p className='mt-2 mb-0 text-fg-secondary text-sm'>{description}</p>
      {action && 'to' in action ? (
        <Button asChild {...buttonProps}>
          <Link to={action.to}>{label}</Link>
        </Button>
      ) : (
        <Button {...buttonProps} onClick={action?.onClick} disabled={!action}>
          {label}
        </Button>
      )}
    </div>
  )
}

export default ReportEmptyPrompt
