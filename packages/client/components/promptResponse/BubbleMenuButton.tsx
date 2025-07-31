import type {ReactNode} from 'react'
import {Button} from '../../ui/Button/Button'
import {cn} from '../../ui/cn'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  className?: string
  children: ReactNode
}
export const BubbleMenuButton = (props: Props) => {
  const {children, isActive, className, ...rest} = props
  return (
    <Button
      variant='flat'
      data-highlighted={isActive ? '' : undefined}
      className={cn(
        'h-7 w-7 rounded-xs hover:bg-slate-300 data-highlighted:bg-slate-300',
        className
      )}
      {...rest}
    >
      {children}
    </Button>
  )
}
