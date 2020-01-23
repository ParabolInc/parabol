import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from 'hooks/useAtmosphere'
import useNoIndex from 'hooks/useNoIndex'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import {TeamInvitationRootQuery} from '__generated__/TeamInvitationRootQuery.graphql'
import {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import TeamInvitation from './TeamInvitation'

interface Props extends WithAtmosphereProps, RouteComponentProps<{token: string}> {}

const query = graphql`
  query TeamInvitationRootQuery($token: ID!) {
    verifiedInvitation(token: $token) {
      ...TeamInvitation_verifiedInvitation
    }
  }
`

const TeamInvitationRoot = (props: Props) => {
  useNoIndex()
  const atmosphere = useAtmosphere()
  const {match} = props
  const {params} = match
  const {token} = params
  return (
    <QueryRenderer<TeamInvitationRootQuery>
      environment={atmosphere}
      query={query}
      variables={{token}}
      fetchPolicy={'store-or-network' as any}
      render={({props: renderProps}) => {
        if (!renderProps) return null
        return <TeamInvitation verifiedInvitation={renderProps.verifiedInvitation} />
      }}
    />
  )
}

export default TeamInvitationRoot
