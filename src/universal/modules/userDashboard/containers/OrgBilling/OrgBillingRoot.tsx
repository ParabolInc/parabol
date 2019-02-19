import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import OrgBilling from 'universal/modules/userDashboard/components/OrgBilling/OrgBilling'
import {LoaderSize} from 'universal/types/constEnums'
import {cacheConfig} from 'universal/utils/constants'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {OrgBillingRoot_organization} from '__generated__/OrgBillingRoot_organization.graphql'

const query = graphql`
  query OrgBillingRootQuery($orgId: ID!, $first: Int!, $after: DateTime) {
    viewer {
      ...OrgBilling_viewer
    }
  }
`

interface Props {
  organization: OrgBillingRoot_organization
}

const OrgBillingRoot = ({organization}: Props) => {
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{orgId: organization.id, first: 3}}
      render={renderQuery(OrgBilling, {props: {organization}, size: LoaderSize.PANEL})}
    />
  )
}

export default createFragmentContainer(
  OrgBillingRoot,
  graphql`
    fragment OrgBillingRoot_organization on Organization {
      ...OrgBilling_organization
      id
    }
  `
)
