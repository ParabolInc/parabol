import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import MyDashboardTimeline from './MyDashboardTimeline'
import {QueryRenderer} from 'react-relay'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {LoaderSize} from '../types/constEnums'
import renderQuery from '../utils/relay/renderQuery'

// Changing the name here requires a change to getLastSeenAtURL.ts
const query = graphql`
  query MyDashboardTimelineRootQuery($first: Int!, $after: DateTime) {
    viewer {
      ...MyDashboardTimeline_viewer
    }
  }
`

interface Props extends WithAtmosphereProps {}

const MyDashboardTimelineRoot = ({atmosphere}: Props) => {
  return (
    <QueryRenderer
      environment={atmosphere}
      variables={{first: 10}}
      query={query}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(MyDashboardTimeline, {size: LoaderSize.PANEL})}
    />
  )
}

export default withAtmosphere(MyDashboardTimelineRoot)
