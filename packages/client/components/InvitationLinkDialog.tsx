import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import {LocalStorageKey} from '../types/constEnums'
import {InvitationLinkDialog_massInvitation$key} from '../__generated__/InvitationLinkDialog_massInvitation.graphql'
import InvitationLinkAuthentication from './InvitationLinkAuthentication'
import InvitationLinkErrorExpired from './InvitationLinkErrorExpired'
import TeamInvitationAccept from './TeamInvitationAccept'
import TeamInvitationErrorNotFound from './TeamInvitationErrorNotFound'

interface Props extends RouteComponentProps<{token: string}> {
  massInvitation: InvitationLinkDialog_massInvitation$key
}

const InvitationLinkDialog = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {match} = useRouter<{token: string}>()
  const {params} = match
  const {token} = params
  useEffect(() => {
    window.localStorage.setItem(LocalStorageKey.INVITATION_TOKEN, token)
  }, [token])
  const {massInvitation: massInvitationRef} = props
  const massInvitation = useFragment(
    graphql`
      fragment InvitationLinkDialog_massInvitation on MassInvitationPayload {
        ...InvitationLinkErrorExpired_massInvitation
        errorType
        inviterName
        teamName
      }
    `,
    massInvitationRef
  )
  if (!massInvitation) {
    // rate limit reached or other server error
    return <TeamInvitationErrorNotFound isMassInvite />
  }
  const {errorType, teamName} = massInvitation
  switch (errorType) {
    case 'notFound':
      return <TeamInvitationErrorNotFound isMassInvite />
    case 'expired':
      return <InvitationLinkErrorExpired massInvitation={massInvitation} />
  }
  const {authToken} = atmosphere
  if (authToken) {
    return <TeamInvitationAccept invitationToken={token} />
  }
  return <InvitationLinkAuthentication teamName={teamName!} invitationToken={token} />
}

export default withRouter(InvitationLinkDialog)
