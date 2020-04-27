import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import {InvitationLinkRootQuery} from '~/__generated__/InvitationLinkRootQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useNoIndex from '../hooks/useNoIndex'
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
  useNoIndex()
  const atmosphere = useAtmosphere()
  const {match} = props
  const {params} = match
  const {token} = params
  return (
    <QueryRenderer<InvitationLinkRootQuery>
      environment={atmosphere}
      query={query}
      variables={{token}}
      fetchPolicy={'store-or-network' as any}
      render={({props: renderProps}) => {
        if (!renderProps) return null
        return <InvitationLink massInvitation={renderProps.massInvitation} />
      }}
    />
  )
}

export default InvitationLinkRoot
