import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import useStoreQueryRetry from '~/hooks/useStoreQueryRetry'
import useAtmosphere from '../hooks/useAtmosphere'
import UserTasksHeader from '../modules/userDashboard/components/UserTasksHeader/UserTasksHeader'
import UserColumnsContainer from '../modules/userDashboard/containers/UserColumns/UserColumnsContainer'
import {MyDashboardTasks_viewer} from '../__generated__/MyDashboardTasks_viewer.graphql'
import ArchiveTaskRoot from './ArchiveTaskRoot'
import parseUserTaskFilters from '~/utils/parseUserTaskFilters'
import setArchivedTasksCheckbox from '~/utils/relay/setArchivedTasksCheckbox'

interface Props {
  viewer: MyDashboardTasks_viewer
  retry(): void
}

const MyDashboardTasks = (props: Props) => {
  const {retry, viewer} = props
  const {showArchived} = parseUserTaskFilters()
  const atmosphere = useAtmosphere()

  const {userIds, teamIds} = parseUserTaskFilters()

  useStoreQueryRetry(retry)
  useDocumentTitle('My Tasks | Parabol', 'My Tasks')
  useEffect(() => {
    return () => setArchivedTasksCheckbox(atmosphere, false)
  }, [])
  return (
    <>
      <UserTasksHeader viewer={viewer} />

      {showArchived ? (
        <ArchiveTaskRoot teamIds={teamIds} userIds={userIds} />
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
    }
  `
})
