import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import renderQuery from '~/utils/relay/renderQuery'
import TeamArchive from '~/modules/teamDashboard/components/TeamArchive/TeamArchive'
import {LoaderSize} from '~/types/constEnums'


const query = graphql`
  query ArchiveTaskRootQuery($teamId: ID, $first: Int!, $after: DateTime) {
    viewer {
      ...TeamArchive_viewer
    }
  }
`

export interface ArchiveTaskRootProps {
  teamId?: string
  team?: any
  showHeader?: boolean
}

const ArchiveTaskRoot = ({teamId, team, showHeader}: ArchiveTaskRootProps) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, first: 40}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(TeamArchive, {
        props: {teamId, team, userId: viewerId, showHeader: showHeader},
        size: LoaderSize.PANEL
      })}
    />
  )
}

export default ArchiveTaskRoot
