import React, {Suspense} from 'react'
import activityLibraryQuery, {
  ActivityLibraryQuery
} from '~/__generated__/ActivityLibraryQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../utils/relay/renderLoader'
import {ActivityLibrary} from './ActivityLibrary'
import TeamSubscription from '../../subscriptions/TeamSubscription'
import useSubscription from '../../hooks/useSubscription'
import TaskSubscription from '../../subscriptions/TaskSubscription'
import NotificationSubscription from '../../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../../subscriptions/OrganizationSubscription'

const ActivityLibaryRoute = () => {
  useSubscription('ActivityLibraryRoute', NotificationSubscription)
  useSubscription('ActivityLibraryRoute', OrganizationSubscription)
  useSubscription('ActivityLibraryRoute', TaskSubscription)
  useSubscription('ActivityLibraryRoute', TeamSubscription)

  const queryRef = useQueryLoaderNow<ActivityLibraryQuery>(activityLibraryQuery)

  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && <ActivityLibrary queryRef={queryRef} />}
    </Suspense>
  )
}

export default ActivityLibaryRoute
