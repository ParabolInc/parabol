import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import LoadingView from 'universal/components/LoadingView/LoadingView'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import UnpaidTeamModal from 'universal/modules/teamDashboard/components/UnpaidTeamModal/UnpaidTeamModal'
import {cacheConfig} from 'universal/utils/constants'

const query = graphql`
  query UnpaidTeamModalRootQuery($teamId: ID!) {
    viewer {
      ...UnpaidTeamModal_viewer
    }
  }
`

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  teamId: string
}

const UnpaidTeamModalRoot = (props: Props) => {
  const {atmosphere, teamId} = props
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent />}
          loading={<LoadingView minHeight='50vh' />}
          ready={
            // @ts-ignore
            <UnpaidTeamModal />
          }
        />
      )}
    />
  )
}

export default withAtmosphere(withRouter(UnpaidTeamModalRoot))
