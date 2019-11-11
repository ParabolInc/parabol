import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import TeamSettings from './TeamSettings/TeamSettings'
import {LoaderSize} from '../../../types/constEnums'
import renderQuery from '../../../utils/relay/renderQuery'
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
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      render={renderQuery(TeamSettings, {size: LoaderSize.PANEL})}
      fetchPolicy={'store-or-network' as any}
    />
  )
}

export default TeamSettingsRoot
