import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {type RouteComponentProps, withRouter} from 'react-router'
import type {TeamInvitationDialog_verifiedInvitation$key} from '../__generated__/TeamInvitationDialog_verifiedInvitation.graphql'
import {LocalStorageKey} from '../types/constEnums'
import {useIsAuthenticated} from './IsAuthenticatedProvider'
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
  verifiedInvitation: TeamInvitationDialog_verifiedInvitation$key
}

const TeamInvitationDialog = (props: Props) => {
  const {verifiedInvitation: verifiedInvitationRef, match} = props
  const verifiedInvitation = useFragment(
    graphql`
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
    `,
    verifiedInvitationRef
  )
  const {params} = match
  const {token: invitationToken} = params

  const isLoggedIn = useIsAuthenticated()
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
  if (isLoggedIn) {
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

export default withRouter(TeamInvitationDialog)
