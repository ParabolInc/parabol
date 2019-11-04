import React, {Component} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps} from 'react-router'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import TeamInvitation from './TeamInvitation'
import {QueryRenderer} from 'react-relay'
import {TeamInvitationRootQuery} from '__generated__/TeamInvitationRootQuery.graphql'

interface Props extends WithAtmosphereProps, RouteComponentProps<{token: string}> {}

const query = graphql`
  query TeamInvitationRootQuery($token: ID!) {
    verifiedInvitation(token: $token) {
      ...TeamInvitation_verifiedInvitation
    }
  }
`

class TeamInvitationRoot extends Component<Props> {
  render() {
    const {
      atmosphere,
      match: {
        params: {token}
      }
    } = this.props
    return (
      <QueryRenderer<TeamInvitationRootQuery>
        environment={atmosphere}
        query={query}
        variables={{token}}
        render={({props: renderProps}) => {
          if (!renderProps) return null
          return <TeamInvitation verifiedInvitation={renderProps.verifiedInvitation} />
        }}
      />
    )
  }
}

export default withAtmosphere(TeamInvitationRoot)
