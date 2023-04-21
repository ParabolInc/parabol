import React from 'react'
import {CategoryID} from './ActivityCard'
import {ActivityLibraryCard} from './ActivityLibraryCard'
import {ActivityBadge} from './ActivityBadge'
import {Add as AddIcon} from '@mui/icons-material'
import {CATEGORY_ID_TO_NAME} from './ActivityLibrary'
import clsx from 'clsx'
import {Link} from 'react-router-dom'

interface Props {
  className?: string
  category: CategoryID
}

const CreateActivityCard = (props: Props) => {
  const {category, className} = props

  return (
    <Link className='flex' to={`/activity-library/new-activity/${category}`}>
      <ActivityLibraryCard
        className={clsx('flex-1 cursor-pointer', className)}
        category={category}
        badge={<ActivityBadge className='mx-2 bg-gold-300 text-grape-700'>Premium</ActivityBadge>}
      >
        <div className='flex flex-1 flex-col items-center justify-center text-center font-semibold md:mx-10'>
          <div className='h-12 w-12'>
            <AddIcon className='h-full w-full text-slate-700' />
          </div>
          Create Custom {category !== 'recommended' ? CATEGORY_ID_TO_NAME[category] : ''} Activity
        </div>
      </ActivityLibraryCard>
    </Link>
  )
}

export default CreateActivityCard
