import React from 'react'
import {graphql} from 'react-relay'
import QueryRenderer from '../../../../components/QueryRenderer/QueryRenderer'
import ProviderList from '../../components/ProviderList/ProviderList'
import {cacheConfig} from '../../../../utils/constants'
import renderQuery from '../../../../utils/relay/renderQuery'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {LoaderSize} from '../../../../types/constEnums'
import useRouter from '../../../../hooks/useRouter'

const teamIntegrationsQuery = graphql`
  query TeamIntegrationsRootQuery($teamId: ID!) {
    viewer {
      ...ProviderList_viewer
    }
  }
`

interface Props {
  teamId: string
}

const TeamIntegrationsRoot = ({teamId}: Props) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={teamIntegrationsQuery}
      variables={{teamId}}
      subParams={{teamId, history}}
      render={renderQuery(ProviderList, {props: {teamId}, size: LoaderSize.PANEL})}
    />
  )
}

export default TeamIntegrationsRoot
