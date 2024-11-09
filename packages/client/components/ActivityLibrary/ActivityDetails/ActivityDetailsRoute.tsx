import {Suspense} from 'react'
import {Redirect} from 'react-router'
import activityDetailsQuery, {
  ActivityDetailsQuery
} from '~/__generated__/ActivityDetailsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import useRouter from '../../../hooks/useRouter'
import {Loader} from '../../../utils/relay/renderLoader'
import ActivityDetails from './ActivityDetails'

const ActivityDetailsRoute = () => {
  const {match} = useRouter<{activityId: string}>()
  const {params} = match
  const {activityId} = params

  const queryRef = useQueryLoaderNow<ActivityDetailsQuery>(activityDetailsQuery, {activityId})

  if (!activityId) return <Redirect to='/activity-library' />

  return (
    <Suspense fallback={<Loader />}>{queryRef && <ActivityDetails queryRef={queryRef} />}</Suspense>
  )
}

export default ActivityDetailsRoute
