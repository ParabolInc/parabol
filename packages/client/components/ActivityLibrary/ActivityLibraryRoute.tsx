import React, {Suspense} from 'react'
import activityLibraryQuery, {
  ActivityLibraryQuery
} from '~/__generated__/ActivityLibraryQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import useRouter from '../../hooks/useRouter'
import {renderLoader} from '../../utils/relay/renderLoader'
import {ActivityLibrary} from './ActivityLibrary'

const ActivityLibaryRoute = () => {
  const {match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId} = params
  const queryRef = useQueryLoaderNow<ActivityLibraryQuery>(activityLibraryQuery)

  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && <ActivityLibrary teamId={teamId} queryRef={queryRef} />}
    </Suspense>
  )
}

export default ActivityLibaryRoute
