import React, {lazy} from 'react'
import {useTranslation} from 'react-i18next'
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
  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const {userIds, teamIds, showArchived} = useUserTaskFilters(atmosphere.viewerId)

  useDocumentTitle(t('UserTaskViewRoot.TasksParabol'), t('UserTaskViewRoot.Tasks'))

  if (showArchived) {
    return <ArchiveTaskUserRoot userIds={userIds} teamIds={teamIds} />
  } else {
    return <MyDashboardTasksRoot />
  }
}

export default UserTaskViewRoot
