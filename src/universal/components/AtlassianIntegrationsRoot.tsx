import React from 'react'
import {graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import {LoaderSize} from 'universal/types/constEnums'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../hooks/useAtmosphere'
import AtlassianIntegrations from './AtlassianIntegrations'

const query = graphql`
  query AtlassianIntegrationsRootQuery {
    viewer {
      id
    }
  }
`

const AtlassianIntegrationsRoot = () => {
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      render={renderQuery(AtlassianIntegrations, {size: LoaderSize.WHOLE_PAGE})}
    />
  )
}

export default AtlassianIntegrationsRoot
