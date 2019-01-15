import React from 'react'
import {graphql} from 'react-relay'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import LoadingView from 'universal/components/LoadingView/LoadingView'
import MyDashboardTasks from 'universal/components/MyDashboardTasks'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {cacheConfig} from 'universal/utils/constants'

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
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight='50vh' />}
          // @ts-ignore
          ready={<MyDashboardTasks />}
        />
      )}
    />
  )
}

export default withAtmosphere(MyDashboardTasksRoot)
