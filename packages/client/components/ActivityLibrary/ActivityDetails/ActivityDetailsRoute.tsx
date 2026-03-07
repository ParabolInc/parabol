import {Suspense} from 'react'
import {Redirect, useParams} from 'react-router'
import activityDetailsQuery, {
  type ActivityDetailsQuery
} from '~/__generated__/ActivityDetailsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {Loader} from '../../../utils/relay/renderLoader'
import ActivityDetails from './ActivityDetails'

const ActivityDetailsRoute = () => {
  const {activityId} = useParams<{activityId: string}>()

  const queryRef = useQueryLoaderNow<ActivityDetailsQuery>(activityDetailsQuery, {activityId})

  if (!activityId) return <Redirect to='/activity-library' />

  return (
    <Suspense fallback={<Loader />}>{queryRef && <ActivityDetails queryRef={queryRef} />}</Suspense>
  )
}

export default ActivityDetailsRoute
