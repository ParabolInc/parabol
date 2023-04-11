import React from 'react'
import {CategoryID} from './ActivityCard'
import {ActivityLibraryCard, ActivityLibraryCardBadge} from './ActivityLibraryCard'
import {Add as AddIcon} from '@mui/icons-material'
import {CATEGORY_ID_TO_NAME} from './ActivityLibrary'
import clsx from 'clsx'

interface Props {
  category: CategoryID
  className?: string
}

const CreateActivityCard = (props: Props) => {
  const {category, className} = props
  return (
    <ActivityLibraryCard
      className={clsx('cursor-pointer', className)}
      category={category}
      badge={<ActivityLibraryCardBadge>Premium</ActivityLibraryCardBadge>}
    >
      <div className='mx-10 flex flex-1 flex-col items-center justify-center text-center font-semibold'>
        <div className='h-12 w-12'>
          <AddIcon style={{width: '100%', height: '100%'}} className='text-slate-700' />
        </div>
        Create Custom {CATEGORY_ID_TO_NAME[category]} Activity
      </div>
    </ActivityLibraryCard>
  )
}

export default CreateActivityCard
