import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import useStoreQueryRetry from '~/hooks/useStoreQueryRetry'
import useAtmosphere from '../hooks/useAtmosphere'
import UserTasksHeader from '../modules/userDashboard/components/UserTasksHeader/UserTasksHeader'
import UserColumnsContainer from '../modules/userDashboard/containers/UserColumns/UserColumnsContainer'
import filterTeam from '../utils/relay/filterTeam'
import {MyDashboardTasks_viewer} from '../__generated__/MyDashboardTasks_viewer.graphql'
import ArchiveTaskRoot from './ArchiveTaskRoot'

interface Props {
  viewer: MyDashboardTasks_viewer
  retry(): void
}

const MyDashboardTasks = (props: Props) => {
  const {retry, viewer} = props
  const {showArchivedTasksCheckbox, teamFilter, teamMembers} = viewer
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const userIds = teamMembers.map(({id}) => id).concat(viewerId)
  useStoreQueryRetry(retry)
  useDocumentTitle('My Tasks | Parabol', 'My Tasks')
  useEffect(() => {
    return () => filterTeam(atmosphere, null)
  }, [])
  return (
    <>
      <UserTasksHeader viewer={viewer} />

      {showArchivedTasksCheckbox ? (
        <ArchiveTaskRoot teamIds={teamFilter ? [teamFilter.id] : null} userIds={userIds} team={teamFilter} />
      ) : (
          <UserColumnsContainer viewer={viewer} />)}
    </>
  )
}

export default createFragmentContainer(MyDashboardTasks, {
  viewer: graphql`
    fragment MyDashboardTasks_viewer on User {
      showArchivedTasksCheckbox
      teamFilter {
        id
        name
        ...TeamArchive_team
      }
      teamMembers(teamId: $teamId, sortBy: "preferredName") {
        id
        preferredName
        tms
      }
      ...UserColumnsContainer_viewer
      ...UserTasksHeader_viewer
    }
  `
})
