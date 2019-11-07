import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {QueryRenderer} from 'react-relay'
import TeamContainer from '../containers/Team/TeamContainer'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {TeamRootQuery} from '__generated__/TeamRootQuery.graphql'
import {createOperationDescriptor, getRequest} from 'relay-runtime'

const query = graphql`
  query TeamRootQuery($teamId: ID!) {
    viewer {
      ...TeamContainer_viewer
    }
  }
`

interface Props extends RouteComponentProps<{teamId: string}> {}

const TeamRoot = ({location, match}: Props) => {
  const {
    params: {teamId}
  } = match
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer<TeamRootQuery>
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      fetchPolicy={'store-or-network' as any}
      render={({props: renderProps}) => {
        const viewer = renderProps ? renderProps.viewer : null
        // @ts-ignore
        return <TeamContainer location={location} match={match} viewer={viewer} teamId={teamId} />
      }}
    />
  )
}

export default withRouter(TeamRoot)
