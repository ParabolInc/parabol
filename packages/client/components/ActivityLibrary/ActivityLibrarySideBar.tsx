import React from 'react'
import LogoBlock from '../LogoBlock/LogoBlock'

const ActivityLibrarySideBar = () => {
  return (
    <div className='w-full'>
      <div className='flex w-full items-center'>
        <LogoBlock className='ml-1' />
        <div className='w-max text-xl font-semibold'>Start Activity</div>
      </div>
    </div>
  )
}

export default ActivityLibrarySideBar
