import React, {Suspense} from 'react'

import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../../utils/relay/renderLoader'
import TeamSubscription from '../../../subscriptions/TeamSubscription'
import useSubscription from '../../../hooks/useSubscription'
import TaskSubscription from '../../../subscriptions/TaskSubscription'
import NotificationSubscription from '../../../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../../../subscriptions/OrganizationSubscription'
import {CreateNewActivity} from './CreateNewActivity'

import createNewActivityQuery, {
  CreateNewActivityQuery
} from '~/__generated__/CreateNewActivityQuery.graphql'

const CreateNewActivityRoute = () => {
  useSubscription('CreateNewActivityRoute', NotificationSubscription)
  useSubscription('CreateNewActivityRoute', OrganizationSubscription)
  useSubscription('CreateNewActivityRoute', TaskSubscription)
  useSubscription('CreateNewActivityRoute', TeamSubscription)

  const queryRef = useQueryLoaderNow<CreateNewActivityQuery>(createNewActivityQuery)

  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && <CreateNewActivity queryRef={queryRef} />}
    </Suspense>
  )
}

export default CreateNewActivityRoute
