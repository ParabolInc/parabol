import type {ReactNode} from 'react'
import {Close} from '~/ui/icons'

interface Props {
  children: ReactNode
  onClose: () => void
}

const HelpMenuContent = (props: Props) => {
  const {children, onClose} = props
  return (
    <div className='relative w-[272px] px-4 py-3 text-[13px] leading-[1.5384615385]'>
      <div
        className='-top-1 absolute right-1 h-[18px] w-[18px] cursor-pointer text-fg-secondary hover:opacity-50'
        data-cy='help-menu-close'
        onClick={onClose}
        title='Close help menu'
      >
        <Close className='h-[18px] w-[18px]' />
      </div>
      {children}
    </div>
  )
}

export default HelpMenuContent
