import React from 'react'
import {ActivityLibraryCard} from './ActivityLibraryCard'
import {ActivityBadge} from './ActivityBadge'
import {Add as AddIcon} from '@mui/icons-material'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {
  QUICK_START_CATEGORY_ID,
  DEFAULT_CARD_THEME,
  CATEGORY_THEMES,
  CategoryID,
  CATEGORY_ID_TO_NAME
} from './Categories'

const CREATE_ACTIVITY_CARD_THEMES = {
  [QUICK_START_CATEGORY_ID]: DEFAULT_CARD_THEME,
  ...CATEGORY_THEMES
}

interface Props {
  className?: string
  category: CategoryID | typeof QUICK_START_CATEGORY_ID
}

const CreateActivityCard = (props: Props) => {
  const {category, className} = props

  return (
    <Link className={clsx('flex', className)} to={`/activity-library/new-activity/${category}`}>
      <ActivityLibraryCard
        className={'flex-1 cursor-pointer'}
        theme={CREATE_ACTIVITY_CARD_THEMES[category]}
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
