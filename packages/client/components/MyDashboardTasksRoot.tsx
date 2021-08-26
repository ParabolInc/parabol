import React, {Suspense} from 'react'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'
import useAtmosphere from '../hooks/useAtmosphere'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import UserTasksHeader from '../modules/userDashboard/components/UserTasksHeader/UserTasksHeader'
import myDashboardTasksAndHeaderQuery, {
  MyDashboardTasksAndHeaderQuery
} from '../__generated__/MyDashboardTasksAndHeaderQuery.graphql'
import ErrorBoundary from './ErrorBoundary'
import MyDashboardTasksAndHeader from './MyDashboardTasksAndHeader'

const MyDashboardTasksRoot = () => {
  const atmosphere = useAtmosphere()
  const {userIds, teamIds} = useUserTaskFilters(atmosphere.viewerId)
  const queryRef = useQueryLoaderNow<MyDashboardTasksAndHeaderQuery>(
    myDashboardTasksAndHeaderQuery,
    {userIds, teamIds}
  )
  return (
    <ErrorBoundary>
      <Suspense fallback={<UserTasksHeader viewerRef={null} />}>
        {queryRef && <MyDashboardTasksAndHeader queryRef={queryRef} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default MyDashboardTasksRoot
