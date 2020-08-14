import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import TeamArchive from '~/modules/teamDashboard/components/TeamArchive/TeamArchive'
import {LoaderSize} from '~/types/constEnums'
import renderQuery from '~/utils/relay/renderQuery'


const query = graphql`
  query ArchiveTaskRootQuery($first: Int!, $after: DateTime, $userIds: [ID!], $teamIds: [ID!]) {
    viewer {
      ...TeamArchive_viewer
    }
  }
`

export interface ArchiveTaskRootProps {
  teamIds?: string[] | null
  userIds?: string[] | null
  team?: any
  returnToTeamId?: string
}

const ArchiveTaskRoot = ({teamIds, team, userIds, returnToTeamId}: ArchiveTaskRootProps) => {
  const atmosphere = useAtmosphere()
  returnToTeamId && useDocumentTitle(`Team Archive | ${team.name}`, 'Archive')

  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamIds, userIds, first: 40}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(TeamArchive, {
        props: {returnToTeamId, team},
        size: LoaderSize.PANEL
      })}
    />
  )
}

export default ArchiveTaskRoot
