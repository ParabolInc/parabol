import React from 'react'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import Organization from 'universal/modules/userDashboard/components/Organization/Organization'
import {cacheConfig} from 'universal/utils/constants'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'
import LoadingView from 'universal/components/LoadingView/LoadingView'
import type {Match} from 'react-router-dom'

const query = graphql`
  query OrganizationRootQuery($orgId: ID!) {
    viewer {
      ...Organization_viewer
    }
  }
`

type Props = {|
  atmosphere: Object,
  match: Match
|}

const OrganizationRoot = (props: Props) => {
  const {atmosphere, match} = props
  const {
    params: {orgId}
  } = match
  console.log('roo')
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{orgId}}
      subParams={{orgId}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight='50vh' />}
          // pass in match to mitigate update blocker
          ready={<Organization match={match} />}
        />
      )}
    />
  )
}

export default withAtmosphere(OrganizationRoot)
