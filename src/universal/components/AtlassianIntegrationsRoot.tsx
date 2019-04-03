import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import {LoaderSize} from 'universal/types/constEnums'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../hooks/useAtmosphere'
import AtlassianIntegrations from './AtlassianIntegrations'

const query = graphql`
  query AtlassianIntegrationsRootQuery($teamId: ID!) {
    viewer {
      ...AtlassianIntegrations_viewer
    }
  }
`

interface Props extends RouteComponentProps<{teamId}> {}

const AtlassianIntegrationsRoot = (props: Props) => {
  const {match} = props
  const {
    params: {teamId}
  } = match
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      render={renderQuery(AtlassianIntegrations, {size: LoaderSize.PANEL, props: {teamId}})}
    />
  )
}

export default withRouter(AtlassianIntegrationsRoot)
