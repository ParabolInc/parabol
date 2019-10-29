import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {QueryRenderer} from 'react-relay'
import TeamContainer from '../containers/Team/TeamContainer'
import {cacheConfig} from '../../../utils/constants'
import useAtmosphere from '../../../hooks/useAtmosphere'

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
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      render={({props: renderProps}) => {
        const viewer = renderProps ? renderProps.viewer : null
        // @ts-ignore
        return <TeamContainer location={location} match={match} viewer={viewer} teamId={teamId} />
      }}
    />
  )
}

export default withRouter(TeamRoot)
