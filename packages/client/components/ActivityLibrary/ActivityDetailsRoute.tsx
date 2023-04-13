import React, {Suspense} from 'react'
import activityDetailsQuery, {
  ActivityDetailsQuery
} from '~/__generated__/ActivityDetailsQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../utils/relay/renderLoader'
import ActivityDetails from './ActivityDetails'
import useRouter from '../../hooks/useRouter'
import {Redirect} from 'react-router'

const ActivityDetailsRoute = () => {
  const {match} = useRouter<{templateId: string}>()
  const {params} = match
  const {templateId} = params

  const queryRef = useQueryLoaderNow<ActivityDetailsQuery>(activityDetailsQuery)

  if (!templateId) return <Redirect to='/activity-library' />

  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && <ActivityDetails queryRef={queryRef} templateId={templateId} />}
    </Suspense>
  )
}

export default ActivityDetailsRoute
