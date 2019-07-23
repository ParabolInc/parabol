import React from 'react'
import {graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import TeamSettings from 'universal/modules/teamDashboard/components/TeamSettings/TeamSettings'
import {LoaderSize} from 'universal/types/constEnums'
import {cacheConfig} from 'universal/utils/constants'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../../../hooks/useAtmosphere'

const query = graphql`
  query TeamSettingsRootQuery($teamId: ID!) {
    viewer {
      ...TeamSettings_viewer
    }
  }
`

interface Props {
  teamId: string
}

const TeamSettingsRoot = ({teamId}: Props) => {
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      render={renderQuery(TeamSettings, {size: LoaderSize.PANEL})}
    />
  )
}

export default TeamSettingsRoot
