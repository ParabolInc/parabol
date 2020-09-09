import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {LoaderSize} from '../types/constEnums'
import renderQuery from '../utils/relay/renderQuery'
import MyDashboardTasks from './MyDashboardTasks'
import {RouteComponentProps} from 'react-router-dom'
import useUserTaskFilters from '~/utils/useUserTaskFilters'

// Changing the name here requires a change to getLastSeenAtURL.ts
const query = graphql`
  query MyDashboardTasksRootQuery($userIds: [ID!], $teamIds: [ID!]) {
    viewer {
      ...MyDashboardTasks_viewer
    }
  }
`
interface Props extends RouteComponentProps<{}> {}

const MyDashboardTasksRoot = ({location}: Props) => {
  const atmosphere = useAtmosphere()
  const {userIds, teamIds} = useUserTaskFilters(atmosphere.viewerId)

  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{userIds, teamIds}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(MyDashboardTasks, {size: LoaderSize.PANEL, props: {location}})}
    />
  )
}

export default MyDashboardTasksRoot
