import {Suspense} from 'react'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import myDashboardTasksAndHeaderQuery, {
  MyDashboardTasksAndHeaderQuery
} from '../__generated__/MyDashboardTasksAndHeaderQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import UserTasksHeader from '../modules/userDashboard/components/UserTasksHeader/UserTasksHeader'
import ErrorBoundary from './ErrorBoundary'
import MyDashboardTasksAndHeader from './MyDashboardTasksAndHeader'

const MyDashboardTasksRoot = () => {
  const atmosphere = useAtmosphere()
  const {userIds, teamIds} = useQueryParameterParser(atmosphere.viewerId)
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
