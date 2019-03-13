import React from 'react'
import {graphql} from 'react-relay'
import MyDashboardTimeline from 'universal/components/MyDashboardTimeline'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {cacheConfig} from 'universal/utils/constants'
import {LoaderSize} from '../types/constEnums'
import renderQuery from '../utils/relay/renderQuery'

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
      cacheConfig={cacheConfig}
      environment={atmosphere}
      variables={{first: 10}}
      query={query}
      render={renderQuery(MyDashboardTimeline, {size: LoaderSize.PANEL})}
    />
  )
}

export default withAtmosphere(MyDashboardTimelineRoot)
