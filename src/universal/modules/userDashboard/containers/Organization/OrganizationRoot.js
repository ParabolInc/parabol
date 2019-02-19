import React from 'react'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import Organization from 'universal/modules/userDashboard/components/Organization/Organization'
import {cacheConfig} from 'universal/utils/constants'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import type {Match} from 'react-router-dom'
import renderQuery from 'universal/utils/relay/renderQuery'

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

export default withAtmosphere(OrganizationRoot)
