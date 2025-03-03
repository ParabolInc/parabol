import {ReactNode} from 'react'
import {Button} from '../../ui/Button/Button'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  children: ReactNode
}
export const BubbleMenuButton = (props: Props) => {
  const {children, isActive, ...rest} = props
  return (
    <Button
      variant='flat'
      data-highlighted={isActive ? '' : undefined}
      className='h-7 w-7 rounded-xs hover:bg-slate-300 data-highlighted:bg-slate-300'
      {...rest}
    >
      {children}
    </Button>
  )
}
