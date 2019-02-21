import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import TeamArchive from 'universal/modules/teamDashboard/components/TeamArchive/TeamArchive'
import {LoaderSize} from 'universal/types/constEnums'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../../../../hooks/useAtmosphere'

const query = graphql`
  query TeamArchiveRootQuery($teamId: ID!, $first: Int!, $after: DateTime) {
    viewer {
      ...TeamArchive_viewer
    }
  }
`

interface Props extends RouteComponentProps<{teamId: string}> {
  team: any
}

const TeamArchiveRoot = ({match, team}: Props) => {
  const atmosphere = useAtmosphere()!
  const {
    params: {teamId}
  } = match
  const {viewerId} = atmosphere
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, first: 40}}
      render={renderQuery(TeamArchive, {
        props: {teamId, team, userId: viewerId},
        size: LoaderSize.PANEL
      })}
    />
  )
}

export default TeamArchiveRoot
