import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import useAtmosphere from '~/hooks/useAtmosphere'
import {LocalStorageKey} from '../types/constEnums'
import {TeamInvitationDialog_verifiedInvitation} from '../__generated__/TeamInvitationDialog_verifiedInvitation.graphql'
import TeamInvitationAccept from './TeamInvitationAccept'
import TeamInvitationEmailCreateAccount from './TeamInvitationEmailCreateAccount'
import TeamInvitationEmailSignin from './TeamInvitationEmailSignin'
import TeamInvitationErrorAccepted from './TeamInvitationErrorAccepted'
import TeamInvitationErrorExpired from './TeamInvitationErrorExpired'
import TeamInvitationErrorNotFound from './TeamInvitationErrorNotFound'
import TeamInvitationGoogleCreateAccount from './TeamInvitationGoogleCreateAccount'
import TeamInvitationGoogleSignin from './TeamInvitationGoogleSignin'
import TeamInvitationSSO from './TeamInvitationSSO'

interface Props extends RouteComponentProps<{token: string}> {
  verifiedInvitation: TeamInvitationDialog_verifiedInvitation
}

const TeamInvitationDialog = (props: Props) => {
  const {verifiedInvitation, match} = props
  const {params} = match
  const {token: invitationToken} = params

  const atmosphere = useAtmosphere()
  useEffect(() => {
    window.localStorage.setItem(LocalStorageKey.INVITATION_TOKEN, invitationToken)
  }, [invitationToken])

  if (!verifiedInvitation) {
    // rate limit reached
    return <TeamInvitationErrorNotFound />
  }
  const {errorType, isGoogle, user, ssoURL} = verifiedInvitation
  switch (errorType) {
    case 'notFound':
      return <TeamInvitationErrorNotFound />
    case 'accepted':
      return <TeamInvitationErrorAccepted verifiedInvitation={verifiedInvitation} />
    case 'expired':
      return <TeamInvitationErrorExpired verifiedInvitation={verifiedInvitation} />
  }
  const {authToken} = atmosphere
  if (authToken) {
    return <TeamInvitationAccept invitationToken={invitationToken} />
  }
  if (ssoURL) {
    return <TeamInvitationSSO ssoURL={ssoURL} />
  }
  if (user) {
    return isGoogle ? (
      <TeamInvitationGoogleSignin verifiedInvitation={verifiedInvitation} />
    ) : (
      <TeamInvitationEmailSignin
        invitationToken={invitationToken}
        verifiedInvitation={verifiedInvitation}
      />
    )
  }
  return isGoogle ? (
    <TeamInvitationGoogleCreateAccount
      invitationToken={invitationToken}
      verifiedInvitation={verifiedInvitation}
    />
  ) : (
    <TeamInvitationEmailCreateAccount
      invitationToken={invitationToken}
      verifiedInvitation={verifiedInvitation}
    />
  )
}

export default createFragmentContainer(withRouter(TeamInvitationDialog), {
  verifiedInvitation: graphql`
    fragment TeamInvitationDialog_verifiedInvitation on VerifiedInvitationPayload {
      ...TeamInvitationErrorAccepted_verifiedInvitation
      ...TeamInvitationErrorExpired_verifiedInvitation
      ...TeamInvitationGoogleSignin_verifiedInvitation
      ...TeamInvitationGoogleCreateAccount_verifiedInvitation
      ...TeamInvitationEmailSignin_verifiedInvitation
      ...TeamInvitationEmailCreateAccount_verifiedInvitation
      errorType
      isGoogle
      ssoURL
      user {
        preferredName
      }
    }
  `
})
