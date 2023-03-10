import React from 'react'
import LogoBlock from '../LogoBlock/LogoBlock'

import {Close} from '@mui/icons-material'
import clsx from 'clsx'

interface Props {
  className?: string
}

export const ActivityLibraryHeader = (props: Props) => {
  const {className} = props

  return (
    <div className={clsx(className)}>
      <div className='flex basis-[15%] items-center justify-start'>
        <LogoBlock className='ml-1' />
        <div className='hidden w-max whitespace-nowrap text-xl font-semibold lg:block'>
          Start Activity
        </div>
      </div>

      <div className='flex flex-1 items-center py-4 md:px-4'>
        <div className='h-8 w-full bg-primary/50'>Search</div>
      </div>

      <div className='flex basis-[15%] items-center justify-end'>
        <button className='p-4'>
          <Close className='h-8 w-8' />
        </button>
      </div>
    </div>
  )
}
