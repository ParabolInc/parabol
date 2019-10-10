import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import MyDashboardTasks from './MyDashboardTasks'
import QueryRenderer from './QueryRenderer/QueryRenderer'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {cacheConfig} from '../utils/constants'
import {LoaderSize} from '../types/constEnums'
import renderQuery from '../utils/relay/renderQuery'

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
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      render={renderQuery(MyDashboardTasks, {size: LoaderSize.PANEL})}
    />
  )
}

export default withAtmosphere(MyDashboardTasksRoot)
