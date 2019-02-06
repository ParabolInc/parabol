import React from 'react'
import {graphql} from 'react-relay'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import MyDashboardTasks from 'universal/components/MyDashboardTasks'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {cacheConfig} from 'universal/utils/constants'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'

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
      // FIXME remove when relay merges PR https://github.com/facebook/relay/pull/2416
      dataFrom={'NETWORK_ONLY'}
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent />}
          loading={<LoadingComponent />}
          // @ts-ignore
          ready={<MyDashboardTasks />}
        />
      )}
    />
  )
}

export default withAtmosphere(MyDashboardTasksRoot)
