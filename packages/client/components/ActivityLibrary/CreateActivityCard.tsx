import React from 'react'
import {ActivityLibraryCard} from './ActivityLibraryCard'
import {ActivityBadge} from './ActivityBadge'
import {Add as AddIcon} from '@mui/icons-material'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {CATEGORY_THEMES, CATEGORY_ID_TO_NAME, AllCategoryID} from './Categories'

interface Props {
  className?: string
  category: AllCategoryID
}

const CreateActivityCard = (props: Props) => {
  const {category, className} = props

  return (
    <Link className={clsx('flex', className)} to={`/activity-library/new-activity/${category}`}>
      <ActivityLibraryCard
        className={'flex-1 cursor-pointer'}
        theme={CATEGORY_THEMES[category]}
        badge={<ActivityBadge className='m-2 bg-gold-300 text-grape-700'>Premium</ActivityBadge>}
      >
        <div className='flex h-full w-full flex-col items-center justify-center pb-2 font-semibold'>
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
