import React from 'react'
import {graphql} from 'react-relay'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import MyDashboardTimeline from 'universal/components/MyDashboardTimeline'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {cacheConfig} from 'universal/utils/constants'

const query = graphql`
  query MyDashboardTimelineRootQuery {
    viewer {
      ...MyDashboardTimeline_viewer
    }
  }
`

interface Props extends WithAtmosphereProps {}

const MyDashboardTimelineRoot = ({atmosphere}: Props) => {
  return (
    <QueryRenderer
      // FIXME remove when relay merges PR https://github.com/facebook/relay/pull/2416
      dataFrom={'NETWORK_ONLY'}
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingComponent />}
          // @ts-ignore
          ready={<MyDashboardTimeline />}
        />
      )}
    />
  )
}

export default withAtmosphere(MyDashboardTimelineRoot)
