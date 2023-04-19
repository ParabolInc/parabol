import React, {PropsWithChildren} from 'react'

import {Close} from '@mui/icons-material'
import clsx from 'clsx'

export const ActivityLibraryHeaderCloseButton = (
  props: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>
) => {
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

export const ActivityLibraryHeaderTitle = (
  props: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
) => {
  const {className, children, ...rest} = props

  return (
    <div
      className={clsx('hidden shrink-0 pr-2 text-lg font-semibold lg:text-xl xl:block', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

interface Props {
  className?: string
  leftNavigation?: React.ReactNode
  rightNavigation?: React.ReactNode
  children?: React.ReactNode
}

export const ActivityLibraryHeader = (props: Props) => {
  const {className, children, leftNavigation = null, rightNavigation = null} = props

  return (
    <div className={clsx('mx-1', className)}>
      <div className='flex basis-[15%] items-center justify-start'>{leftNavigation}</div>

      <div className='flex flex-1 items-center'>
        <div className='mx-auto w-full md:px-4'>{children}</div>
      </div>

      <div className='flex basis-[15%] items-center justify-end'>{rightNavigation}</div>
    </div>
  )
}

export const ActivityLibraryMobileHeader = (props: Props) => {
  const {className, rightNavigation, children} = props

  return (
    <div className={clsx('mx-1', className)}>
      <div className='flex flex-1 items-center px-4'>{children}</div>

      <div className='flex basis-1/5 items-center justify-end'>{rightNavigation}</div>
    </div>
  )
}
