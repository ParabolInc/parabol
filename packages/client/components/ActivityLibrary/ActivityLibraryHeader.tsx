import React, {PropsWithChildren} from 'react'
import LogoBlock from '../LogoBlock/LogoBlock'

import {Close} from '@mui/icons-material'
import clsx from 'clsx'

const CloseButton = (props: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => {
  const {className, ...rest} = props

  return (
    <button
      className={clsx(
        'flex h-10 w-10 cursor-pointer rounded-full bg-transparent hover:bg-slate-300'
      )}
      {...rest}
    >
      <Close className='m-auto h-8 w-8' />
    </button>
  )
}

interface Props {
  className?: string
  onClose: () => void
  children: React.ReactNode
}

export const ActivityLibraryHeader = (props: Props) => {
  const {className, onClose, children} = props

  return (
    <div className={clsx('mx-1', className)}>
      <div className='flex basis-[15%] items-center justify-start'>
        <LogoBlock className='shrink-0' />
        <div className='hidden shrink-0 pr-2 text-lg font-semibold lg:block lg:text-xl'>
          Start Activity
        </div>
      </div>

      <div className='flex flex-1 items-center md:px-4'>{children}</div>

      <div className='flex basis-[15%] items-center justify-end'>
        <CloseButton className='shrink-0' onClick={onClose} />
      </div>
    </div>
  )
}

export const ActivityLibraryMobileHeader = (props: Props) => {
  const {className, onClose, children} = props

  return (
    <div className={clsx('mx-1', className)}>
      <div className='flex flex-1 items-center px-4'>{children}</div>

      <div className='flex basis-1/5 items-center justify-end'>
        <CloseButton className='shrink-0' onClick={onClose} />
      </div>
    </div>
  )
}
