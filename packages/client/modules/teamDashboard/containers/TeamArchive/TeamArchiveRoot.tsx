import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps} from 'react-router'
import {QueryRenderer} from 'react-relay'
import TeamArchive from '../../components/TeamArchive/TeamArchive'
import {LoaderSize} from '../../../../types/constEnums'
import renderQuery from '../../../../utils/relay/renderQuery'
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
  const atmosphere = useAtmosphere()
  const {
    params: {teamId}
  } = match
  const {viewerId} = atmosphere
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, first: 40}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(TeamArchive, {
        props: {teamId, team, userId: viewerId},
        size: LoaderSize.PANEL
      })}
    />
  )
}

export default TeamArchiveRoot
