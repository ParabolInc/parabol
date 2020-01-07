import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import renderQuery from '../utils/relay/renderQuery'
import MassInvitationTokenLink from './MassInvitationTokenLink'

const query = graphql`
  query MassInvitationTokenLinkRootQuery($teamId: ID!) {
    viewer {
      ...MassInvitationTokenLink_viewer
    }
  }
`

interface Props {
  teamId: string
}

const MassInvitationTokenLinkRoot = (props: Props) => {
  const {teamId} = props
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(MassInvitationTokenLink)}
    />
  )
}

export default MassInvitationTokenLinkRoot
