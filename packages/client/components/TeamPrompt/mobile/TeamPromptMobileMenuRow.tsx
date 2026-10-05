import type {ReactNode} from 'react'
import {Link} from 'react-router'
import {OpenInNew} from '~/ui/icons'
import {cn} from '../../../ui/cn'

interface Props {
  label: string
  icon: ReactNode
  onClick?: () => void
  to?: string
  isNewTab?: boolean
  isDisabled?: boolean
  isDestructive?: boolean
}

const TeamPromptMobileMenuRow = (props: Props) => {
  const {label, icon, onClick, to, isNewTab, isDisabled, isDestructive} = props
  const className = cn(
    'flex min-h-12 w-full cursor-pointer items-center gap-3.5 bg-transparent px-4 text-left text-base text-fg-primary hover:bg-surface-hover',
    isDestructive && 'text-fg-error',
    isDisabled && 'pointer-events-none opacity-50'
  )
  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={className}
        {...(isNewTab && {target: '_blank', rel: 'noopener noreferrer'})}
      >
        {icon}
        <span className='flex-1'>{label}</span>
        <OpenInNew className='text-fg-secondary text-lg' />
      </Link>
    )
  }
  return (
    <button type='button' disabled={isDisabled} onClick={onClick} className={className}>
      {icon}
      {label}
    </button>
  )
}

export default TeamPromptMobileMenuRow
