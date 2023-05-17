import React from 'react'

import clsx from 'clsx'

interface Props {
  className?: string
  leftNavigation?: React.ReactNode
  rightNavigation?: React.ReactNode
  title?: React.ReactNode
  children?: React.ReactNode
}

export const ActivityLibraryHeader = (props: Props) => {
  const {className, children, title = null, leftNavigation = null, rightNavigation = null} = props

  return (
    <div className={clsx('mx-1', className)}>
      <div className='flex basis-[15%] items-center justify-start gap-x-2 px-2'>
        {leftNavigation}
        <div className='hidden shrink-0 text-lg font-semibold lg:text-xl xl:block'>{title}</div>
      </div>

      <div className='flex flex-1 items-center'>
        <div className='mx-auto w-full md:px-4'>{children}</div>
      </div>

      <div className='flex basis-[15%] items-center justify-end px-2'>{rightNavigation}</div>
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
