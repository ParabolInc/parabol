import {Suspense} from 'react'
import {Navigate, useParams} from 'react-router'
import activityDetailsQuery, {
  type ActivityDetailsQuery
} from '~/__generated__/ActivityDetailsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {Loader} from '../../../utils/relay/renderLoader'
import ActivityDetails from './ActivityDetails'

const ActivityDetailsRoute = () => {
  const {activityId} = useParams()

  const queryRef = useQueryLoaderNow<ActivityDetailsQuery>(activityDetailsQuery, {
    activityId: activityId!
  })

  if (!activityId) return <Navigate to='/activity-library' replace />

  return (
    <Suspense fallback={<Loader />}>{queryRef && <ActivityDetails queryRef={queryRef} />}</Suspense>
  )
}

export default ActivityDetailsRoute
