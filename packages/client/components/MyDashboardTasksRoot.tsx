import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import MyDashboardTasks from './MyDashboardTasks'
import {QueryRenderer} from 'react-relay'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {LoaderSize} from '../types/constEnums'
import renderQuery from '../utils/relay/renderQuery'

// Changing the name here requires a change to getLastSeenAtURL.ts
const query = graphql`
  query MyDashboardTasksRootQuery {
    viewer {
      ...MyDashboardTasks_viewer
    }
  }
`

interface Props extends WithAtmosphereProps {}

const MyDashboardTasksRoot = ({atmosphere}: Props) => {
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(MyDashboardTasks, {size: LoaderSize.PANEL})}
    />
  )
}

export default withAtmosphere(MyDashboardTasksRoot)
