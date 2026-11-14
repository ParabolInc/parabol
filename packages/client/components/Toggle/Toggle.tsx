import type * as React from 'react'
import {cn} from '../../ui/cn'

interface Props {
  active: boolean
  disabled?: boolean
  onClick: (e: React.MouseEvent) => void
}

const Toggle = (props: Props) => {
  const {active, disabled, onClick} = props

  return (
    <div className='px-[1px] py-[5px]' onClick={disabled ? undefined : onClick}>
      <div
        className={cn(
          'relative block h-3.5 w-[34px] min-w-[34px] select-none rounded-[14px] text-white transition-[background-color] duration-100 ease-[cubic-bezier(0,0,.2,1)]',
          active ? 'bg-slate-500' : 'bg-slate-400',
          disabled ? 'cursor-not-allowed opacity-[.38]' : 'cursor-pointer'
        )}
      >
        <div
          className={cn(
            '-top-[3px] absolute block h-5 w-5 rounded-full shadow-[0px_3px_1px_-2px_rgba(0,0,0,.2),0px_2px_2px_0px_rgba(0,0,0,.14),0px_1px_5px_0px_rgba(0,0,0,.12)] transition-transform duration-100 ease-[cubic-bezier(0,0,.2,1)]',
            active ? 'translate-x-[15px] bg-grape-700' : '-translate-x-[1px] bg-white'
          )}
        />
      </div>
    </div>
  )
}

export default Toggle
