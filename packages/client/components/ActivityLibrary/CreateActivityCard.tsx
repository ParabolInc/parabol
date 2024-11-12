import {Add as AddIcon} from '@mui/icons-material'
import clsx from 'clsx'
import {Link} from 'react-router-dom'

import {ActivityCard} from './ActivityCard'
import {AllCategoryID, CATEGORY_ID_TO_NAME, CATEGORY_THEMES} from './Categories'

interface Props {
  className?: string
  category: AllCategoryID
}

const CreateActivityCard = (props: Props) => {
  const {category, className} = props

  return (
    <Link
      className={clsx('flex rounded-2xl hover:bg-slate-100 focus:outline-sky-500', className)}
      to={`/activity-library/new-activity/${category}`}
    >
      <ActivityCard className={'flex-1 cursor-pointer'} theme={CATEGORY_THEMES[category]}>
        <div className='flex h-full w-full flex-col items-center justify-center pb-2 font-semibold'>
          <div className='h-12 w-12'>
            <AddIcon className='h-full w-full text-slate-700' />
          </div>
          Create Custom {category !== 'recommended' ? CATEGORY_ID_TO_NAME[category] : ''} Activity
        </div>
      </ActivityCard>
    </Link>
  )
}

export default CreateActivityCard
