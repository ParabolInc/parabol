import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps} from 'react-router'
import {QueryRenderer} from 'react-relay'
import Organization from '../../components/Organization/Organization'
import renderQuery from '../../../../utils/relay/renderQuery'
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
      environment={atmosphere}
      query={query}
      variables={{orgId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(Organization, {props: {match}, Loader: <div />})}
    />
  )
}

export default OrganizationRoot
