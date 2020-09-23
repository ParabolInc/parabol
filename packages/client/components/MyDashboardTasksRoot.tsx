import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import MyDashboardTasks from './MyDashboardTasks'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'
import UserTasksHeader from '~/modules/userDashboard/components/UserTasksHeader/UserTasksHeader'

// Changing the name here requires a change to getLastSeenAtURL.ts
const query = graphql`
  query MyDashboardTasksRootQuery($first: Int!, $after: DateTime, $userIds: [ID!], $teamIds: [ID!]) {
    viewer {
      ...UserTasksHeader_viewer
      ...MyDashboardTasks_viewer
    }
  }
`

const renderQuery = ({error, retry, props}) => {
  if (error) {
    return <div>{error.message}</div>
  }
  if (!props) {
    return <UserTasksHeader viewer={null} />
  }
  return (
    <>
      <UserTasksHeader viewer={props.viewer} />
      <MyDashboardTasks retry={retry!} viewer={props?.viewer ?? null} />
    </>
  )
}

const MyDashboardTasksRoot = () => {
  const atmosphere = useAtmosphere()
  const {userIds, teamIds} = useUserTaskFilters(atmosphere.viewerId)
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{userIds, teamIds, first: 10}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery}
    />
  )
}

export default MyDashboardTasksRoot
