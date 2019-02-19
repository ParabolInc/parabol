import React from 'react'
import {graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import OrgBilling from 'universal/modules/userDashboard/components/OrgBilling/OrgBilling'
import {LoaderSize} from 'universal/types/constEnums'
import {cacheConfig} from 'universal/utils/constants'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../../../../hooks/useAtmosphere'

const query = graphql`
  query OrgBillingRootQuery($orgId: ID!, $first: Int!, $after: DateTime) {
    viewer {
      ...OrgBilling_viewer
    }
  }
`

interface Props {
  organization: any
}

const OrgBillingRoot = ({organization}: Props) => {
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{orgId: organization.orgId, first: 3}}
      render={renderQuery(OrgBilling, {props: {organization}, size: LoaderSize.PANEL})}
    />
  )
}

export default OrgBillingRoot
