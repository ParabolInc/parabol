import React, {Suspense} from 'react'
import activityLibraryQuery, {
  ActivityLibraryQuery
} from '~/__generated__/ActivityLibraryQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../utils/relay/renderLoader'
import {ActivityLibrary} from './ActivityLibrary'

const ActivityLibaryRoute = () => {
  const queryRef = useQueryLoaderNow<ActivityLibraryQuery>(activityLibraryQuery)

  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && <ActivityLibrary queryRef={queryRef} />}
    </Suspense>
  )
}

export default ActivityLibaryRoute
