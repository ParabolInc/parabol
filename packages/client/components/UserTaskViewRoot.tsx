import React, {lazy} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'

const MyDashboardTasksRoot = lazy(
  () => import(/* webpackChunkName: 'MyDashboardTasksRoot' */ '../components/MyDashboardTasksRoot')
)

const ArchiveTaskUserRoot = lazy(
  () => import(/* webpackChunkName: 'ArchiveTaskUserRoot' */ '../components/ArchiveTaskUserRoot')
)

const UserTaskViewRoot = () => {
  const atmosphere = useAtmosphere()
  const {userIds, teamIds, showArchived} = useUserTaskFilters(atmosphere.viewerId)

  useDocumentTitle('Tasks | Parabol', 'Tasks')

  if (showArchived) {
    return <ArchiveTaskUserRoot userIds={userIds} teamIds={teamIds} />
  } else {
    return <MyDashboardTasksRoot />
  }
}

export default UserTaskViewRoot
