import PropTypes from 'prop-types'
import React from 'react'
import ErrorComponent from 'universal/components/ErrorComponent/ErrorComponent'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import OrgBilling from 'universal/modules/userDashboard/components/OrgBilling/OrgBilling'
import {cacheConfig} from 'universal/utils/constants'
import LoadingView from 'universal/components/LoadingView/LoadingView'
import RelayTransitionGroup from 'universal/components/RelayTransitionGroup'

const query = graphql`
  query OrgBillingRootQuery($orgId: ID!, $first: Int!, $after: DateTime) {
    viewer {
      ...OrgBilling_viewer
    }
  }
`

const OrgBillingRoot = ({atmosphere, organization}) => {
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{orgId: organization.orgId, first: 3}}
      render={(readyState) => (
        <RelayTransitionGroup
          readyState={readyState}
          error={<ErrorComponent height={'14rem'} />}
          loading={<LoadingView minHeight='50vh' />}
          ready={<OrgBilling organization={organization} />}
        />
      )}
    />
  )
}

OrgBillingRoot.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  organization: PropTypes.object
}

export default withAtmosphere(OrgBillingRoot)
