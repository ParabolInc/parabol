import type {ReactNode} from 'react'
import {Button} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'

interface Props {
  children?: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  waiting?: boolean
}

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
