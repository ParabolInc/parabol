import {useParams} from '@tanstack/react-router'
import {Suspense} from 'react'
import activityDetailsQuery, {
  type ActivityDetailsQuery
} from '~/__generated__/ActivityDetailsQuery.graphql'
import Redirect from '~/routing/Redirect'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {Loader} from '../../../utils/relay/renderLoader'
import ActivityDetails from './ActivityDetails'

const ActivityDetailsRoute = () => {
  const {activityId} = useParams({strict: false})

  const queryRef = useQueryLoaderNow<ActivityDetailsQuery>(activityDetailsQuery, {
    activityId: activityId!
  })

  if (!activityId) return <Redirect to='/activity-library' replace />

  return (
    <Suspense fallback={<Loader />}>{queryRef && <ActivityDetails queryRef={queryRef} />}</Suspense>
  )
}

export default ActivityDetailsRoute
