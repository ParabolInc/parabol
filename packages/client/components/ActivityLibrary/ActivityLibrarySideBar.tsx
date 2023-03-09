import React from 'react'
import LogoBlock from '../LogoBlock/LogoBlock'

const ActivityLibrarySideBar = () => {
  return (
    <div className='mr-20'>
      <div className='flex w-max items-center'>
        <LogoBlock className='ml-1' />
        <div className='w-max text-xl font-semibold'>Start Activity</div>
      </div>
    </div>
  )
}

export default ActivityLibrarySideBar
