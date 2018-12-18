import React, {Component} from 'react'
import {graphql, QueryRenderer} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import {WithAtmosphereProps} from 'universal/decorators/withAtmosphere/withAtmosphere'
import withAtmosphere from '../decorators/withAtmosphere/withAtmosphere'
import TeamInvitation from './TeamInvitation'

interface Props extends WithAtmosphereProps, RouteComponentProps<{token: string}> {}

const query = graphql`
  query TeamInvitationRootQuery($token: ID!) {
    verifiedInvitation(token: $token) {
      ...TeamInvitationDialog_verifiedInvitation
    }
  }
`

class TeamInvitationRoot extends Component<Props> {
  render () {
    const {
      atmosphere,
      match: {
        params: {token}
      }
    } = this.props
    return (
      <QueryRenderer
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
