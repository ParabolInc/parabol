import type {ReactNode} from 'react'
import {Close} from '~/ui/icons'
import {Button} from '../Button/Button'

interface Props {
  icon: ReactNode
  title: string
  onClose: () => void
  children?: ReactNode
}

export const BottomSheetHeader = ({icon, title, onClose, children}: Props) => (
  <div className='flex h-14 shrink-0 items-center gap-2 pr-1 pl-4'>
    <span className='flex h-[22px] w-[22px] items-center justify-center text-accent'>{icon}</span>
    <h2 className='m-0 flex-1 truncate font-semibold text-[17px]'>{title}</h2>
    {children}
    <Button
      variant='flat'
      shape='icon'
      aria-label='Close'
      className='h-11 w-11 p-0 text-fg-secondary'
      onClick={onClose}
    >
      <Close className='h-6 w-6' />
    </Button>
  </div>
)
