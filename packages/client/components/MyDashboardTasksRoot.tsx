import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {LoaderSize} from '../types/constEnums'
import renderQuery from '../utils/relay/renderQuery'
import MyDashboardTasks from './MyDashboardTasks'

// Changing the name here requires a change to getLastSeenAtURL.ts
const query = graphql`
  query MyDashboardTasksRootQuery($userIds: [ID!]) {
    viewer {
      ...MyDashboardTasks_viewer
    }
  }
`

const MyDashboardTasksRoot = () => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const userIds = [viewerId]

  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{userIds}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(MyDashboardTasks, {size: LoaderSize.PANEL})}
    />
  )
}

export default MyDashboardTasksRoot
