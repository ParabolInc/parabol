import graphql from 'babel-plugin-relay/macro'
import React, {lazy} from 'react'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import useStoreQueryRetry from '~/hooks/useStoreQueryRetry'
import useAtmosphere from '../hooks/useAtmosphere'
import UserColumnsContainer from '../modules/userDashboard/containers/UserColumns/UserColumnsContainer'
import {MyDashboardTasks_viewer} from '../__generated__/MyDashboardTasks_viewer.graphql'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'

const ArchivedTasks = lazy(() =>
  import(/* webpackChunkName: 'ArchiveTaskRoot' */ '../components/ArchiveTaskRoot')
)

interface Props {
  viewer: MyDashboardTasks_viewer | null
  retry(): void
}

const MyDashboardTasks = (props: Props) => {
  const {retry, viewer} = props
  const atmosphere = useAtmosphere()

  const {userIds, teamIds, showArchived} = useUserTaskFilters(atmosphere.viewerId)

  useStoreQueryRetry(retry)
  useDocumentTitle('My Tasks | Parabol', 'My Tasks')

  if (!viewer) return null
  if (showArchived) {
    return <ArchivedTasks userIds={userIds} teamIds={teamIds} team={null} />
  } else {
    return <UserColumnsContainer viewer={viewer} />
  }
}

export default createFragmentContainer(MyDashboardTasks, {
  viewer: graphql`
    fragment MyDashboardTasks_viewer on User {
      ...UserColumnsContainer_viewer
    }
  `
})
