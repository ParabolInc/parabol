import React from 'react'
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
