import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import useStoreQueryRetry from '~/hooks/useStoreQueryRetry'
import useAtmosphere from '../hooks/useAtmosphere'
import UserTasksHeader from '../modules/userDashboard/components/UserTasksHeader/UserTasksHeader'
import UserColumnsContainer from '../modules/userDashboard/containers/UserColumns/UserColumnsContainer'
import {MyDashboardTasks_viewer} from '../__generated__/MyDashboardTasks_viewer.graphql'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'
import TeamArchive from '~/modules/teamDashboard/components/TeamArchive/TeamArchive'

interface Props {
  viewer: MyDashboardTasks_viewer
  retry(): void
}

const MyDashboardTasks = (props: Props) => {
  const {retry, viewer} = props
  const atmosphere = useAtmosphere()

  const {showArchived} = useUserTaskFilters(atmosphere.viewerId)

  useStoreQueryRetry(retry)
  useDocumentTitle('My Tasks | Parabol', 'My Tasks')
  return (
    <>
      <UserTasksHeader viewer={viewer} />

      {showArchived ? (
        <TeamArchive viewer={viewer} />
      ) : (
          <UserColumnsContainer viewer={viewer} />)}
    </>
  )
}

export default createFragmentContainer(MyDashboardTasks, {
  viewer: graphql`
    fragment MyDashboardTasks_viewer on User {
      ...UserColumnsContainer_viewer
      ...UserTasksHeader_viewer
      ...TeamArchive_viewer
    }
  `
})
