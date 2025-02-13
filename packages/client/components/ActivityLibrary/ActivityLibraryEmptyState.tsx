import FavoriteIcon from '@mui/icons-material/Favorite'
import favoriteImg from '../../../../static/images/illustrations/favorite-empty-state.png'
import halloweenRetrospectiveTemplate from '../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import {AllCategoryID, QUICK_START_CATEGORY_ID} from './Categories'
import CreateActivityCard from './CreateActivityCard'

type Props = {
  categoryId: AllCategoryID
  searchQuery: string
}

const ActivityLibraryEmptyState = (props: Props) => {
  const {categoryId, searchQuery} = props
  const showResultsNotFound = categoryId !== 'custom' || searchQuery !== ''

  if (!searchQuery && categoryId === 'favorite') {
    return (
      <div className='relative mx-auto flex justify-center p-2 align-middle text-slate-700'>
        <div className='p-4 md:p-0'>
          <img
            className='w-[500px] md:w-[700px] lg:w-[900px]'
            src={favoriteImg}
            alt='Favorite placeholder'
          />
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'>
            <div className='flex flex-col items-center'>
              <FavoriteIcon
                className='icon-color-red icon-border-gold rounded-full p-3 text-5xl md:text-6xl lg:p-5 lg:text-8xl'
                style={{
                  color: 'red',
                  border: '2px solid gold',
                  borderRadius: '50%'
                }}
              />

              <span className='mt-2 text-center md:text-lg'>
                Activities you mark as favorite will show up here
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto flex p-2 text-slate-700'>
      <div className='ml-10'>
        {showResultsNotFound && (
          <>
            <img className='w-32' src={halloweenRetrospectiveTemplate} />
            <div className='mb-4 text-xl font-semibold'>No results found!</div>
            <div className='mb-6 max-w-[360px]'>
              Try tapping a category above, using a different search, or creating exactly what you
              have in mind.
            </div>
          </>
        )}
        <div className='h-40 w-64'>
          <CreateActivityCard category={QUICK_START_CATEGORY_ID} className='h-full' />
        </div>
      </div>
    </div>
  )
}

export default ActivityLibraryEmptyState
