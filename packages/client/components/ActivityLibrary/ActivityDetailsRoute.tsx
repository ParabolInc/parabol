import React, {Suspense, useEffect} from 'react'
import activityDetailsQuery, {
  ActivityDetailsQuery
} from '~/__generated__/ActivityDetailsQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../utils/relay/renderLoader'
import ActivityDetails from './ActivityDetails'
import useRouter from '../../hooks/useRouter'

const ActivityDetailsRoute = () => {
  const {history, match} = useRouter<{templateId: string}>()
  const {params} = match
  const {templateId} = params
  useEffect(() => {
    if (!templateId) {
      history.replace('/activity-library')
    }
  }, [])

  const queryRef = useQueryLoaderNow<ActivityDetailsQuery>(activityDetailsQuery)

  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && <ActivityDetails queryRef={queryRef} templateId={templateId} />}
    </Suspense>
  )
}

export default ActivityDetailsRoute
