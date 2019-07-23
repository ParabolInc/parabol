import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import Organization from 'universal/modules/userDashboard/components/Organization/Organization'
import {cacheConfig} from 'universal/utils/constants'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../../../../hooks/useAtmosphere'

const query = graphql`
  query OrganizationRootQuery($orgId: ID!) {
    viewer {
      ...Organization_viewer
    }
  }
`

interface Props extends RouteComponentProps<{orgId: string}> {}

const OrganizationRoot = (props: Props) => {
  const {match} = props
  const {
    params: {orgId}
  } = match
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{orgId}}
      subParams={{orgId}}
      render={renderQuery(Organization, {props: {match}, Loader: <div />})}
    />
  )
}

export default OrganizationRoot
