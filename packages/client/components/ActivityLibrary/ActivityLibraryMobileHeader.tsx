import React from 'react'

import {Close} from '@mui/icons-material'
import clsx from 'clsx'

interface Props {
  className?: string
}

export const ActivityLibraryMobileHeader = (props: Props) => {
  const {className} = props

  return (
    <div className={clsx(className)}>
      <div className='flex flex-1 items-center p-4'>
        <div className='h-8 w-full bg-primary/50'>Search</div>
      </div>

      <div className='flex basis-1/5 items-center justify-end'>
        <button className='p-4'>
          <Close className='h-8 w-8' />
        </button>
      </div>
    </div>
  )
}
