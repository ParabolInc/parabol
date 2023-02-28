import React, {Suspense} from 'react'

import {ActivityLibrary} from './ActivityLibrary'
import activityLibraryQuery, {
  ActivityLibraryQuery
} from '~/__generated__/ActivityLibraryQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../utils/relay/renderLoader'

const ActivityLibaryRoute = () => {
  const queryRef = useQueryLoaderNow<ActivityLibraryQuery>(activityLibraryQuery)

  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && <ActivityLibrary queryRef={queryRef} />}
    </Suspense>
  )
}

export default ActivityLibaryRoute
