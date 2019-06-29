import React from 'react'
import {graphql, QueryRenderer} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import InvitationLink from './InvitationLink'

interface Props extends RouteComponentProps<{token: string}> {}

const query = graphql`
  query InvitationLinkRootQuery($token: ID!) {
    massInvitation(token: $token) {
      ...InvitationLink_massInvitation
    }
  }
`

const InvitationLinkRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {match} = props
  const {params} = match
  const {token} = params
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{token}}
      render={({props: renderProps}) => {
        if (!renderProps) return null
        return <InvitationLink massInvitation={renderProps.massInvitation} />
      }}
    />
  )
}

export default InvitationLinkRoot
