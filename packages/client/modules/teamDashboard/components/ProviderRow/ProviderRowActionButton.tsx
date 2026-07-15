import type {ReactNode} from 'react'
import {Button} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'

interface Props {
  children?: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  waiting?: boolean
  // Retained for backwards-compat with existing callers (Connect/ContactUs pass 'warm'),
  // but these action buttons render as a neutral outline in both callers, so it's ignored.
  palette?: 'warm' | 'dark' | 'mid' | 'blue'
}

// Migrated off the deprecated Emotion FlatButton to ui/Button so its hover/disabled states
// are token-driven Tailwind (hover:bg-surface-hover, disabled:opacity-50) — legible in both
// themes and immune to the Emotion runtime-style staleness that made the old hover illegible.
const ProviderRowActionButton = (props: Props) => {
  const {children, className, disabled, onClick, waiting} = props
  return (
    <Button
      variant='outline'
      size='md'
      shape='pill'
      onClick={onClick}
      disabled={disabled || waiting}
      className={cn('w-full min-w-9 whitespace-nowrap', className)}
    >
      {children}
    </Button>
  )
}

export default ProviderRowActionButton
