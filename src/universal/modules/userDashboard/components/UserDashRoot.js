import PropTypes from 'prop-types'
import React from 'react'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import UserDashMain from 'universal/modules/userDashboard/components/UserDashMain/UserDashMain'
import {cacheConfig} from 'universal/utils/constants'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import LoadingView from 'universal/components/LoadingView/LoadingView'

const query = graphql`
  query UserDashRootQuery {
    viewer {
      ...UserDashMain_viewer
    }
  }
`

const UserDashRoot = ({atmosphere}) => {
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
          ready={<UserDashMain />}
        />
      )}
    />
  )
}

UserDashRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired
}

export default withAtmosphere(UserDashRoot)
