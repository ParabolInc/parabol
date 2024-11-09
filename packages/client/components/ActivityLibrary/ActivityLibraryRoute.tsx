import {Suspense} from 'react'
import activityLibraryQuery, {
  ActivityLibraryQuery
} from '~/__generated__/ActivityLibraryQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {Loader} from '../../utils/relay/renderLoader'
import {ActivityLibrary} from './ActivityLibrary'

const ActivityLibraryRoute = () => {
  const queryRef = useQueryLoaderNow<ActivityLibraryQuery>(activityLibraryQuery)

  return (
    <Suspense fallback={<Loader />}>{queryRef && <ActivityLibrary queryRef={queryRef} />}</Suspense>
  )
}

export default ActivityLibraryRoute
