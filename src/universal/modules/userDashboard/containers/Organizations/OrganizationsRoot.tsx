import React from 'react'
import {graphql} from 'react-relay'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import LoadingView from 'universal/components/LoadingView/LoadingView'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import Organizations from 'universal/modules/userDashboard/components/Organizations/Organizations'
import {cacheConfig} from 'universal/utils/constants'

const query = graphql`
  query OrganizationsRootQuery {
    viewer {
      ...Organizations_viewer
    }
  }
`

interface Props extends WithAtmosphereProps {}

const OrganizationsRoot = (props: Props) => {
  const {atmosphere} = props
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight="50vh" />}
          ready={<Organizations />}
        />
      )}
    />
  )
}

export default withAtmosphere(OrganizationsRoot)
