import {Add as AddIcon} from '@mui/icons-material'
import {Link} from 'react-router'
import {cn} from '../../ui/cn'

import {ActivityCard} from './ActivityCard'
import {type AllCategoryID, CATEGORY_ID_TO_NAME, CATEGORY_THEMES} from './Categories'

interface Props {
  className?: string
  category: AllCategoryID
}

const CreateActivityCard = (props: Props) => {
  const {category, className} = props

  return (
    <Link
      className={cn('flex rounded-2xl hover:bg-surface-raised focus:outline-accent', className)}
      to={`/activity-library/new-activity/${category}`}
    >
      <ActivityCard className={'flex-1 cursor-pointer'} theme={CATEGORY_THEMES[category]}>
        <div className='flex h-full w-full flex-col items-center justify-center pb-2 font-semibold'>
          <div className='h-12 w-12'>
            <AddIcon className='h-full w-full text-fg-primary' />
          </div>
          Create Custom {category !== 'recommended' ? CATEGORY_ID_TO_NAME[category] : ''} Activity
        </div>
      </ActivityCard>
    </Link>
  )
}

export default CreateActivityCard
