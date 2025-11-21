import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {type RouteComponentProps, withRouter} from 'react-router'
import type {InvitationLinkDialog_massInvitation$key} from '../__generated__/InvitationLinkDialog_massInvitation.graphql'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useMetaTagContent from '../hooks/useMetaTagContent'
import useRouter from '../hooks/useRouter'
import {LocalStorageKey} from '../types/constEnums'
import InvitationLinkAuthentication from './InvitationLinkAuthentication'
import InvitationLinkErrorExpired from './InvitationLinkErrorExpired'
import {useIsAuthenticated} from './IsAuthenticatedProvider'
import TeamInvitationAccept from './TeamInvitationAccept'
import TeamInvitationErrorNotFound from './TeamInvitationErrorNotFound'

interface Props extends RouteComponentProps<{token: string}> {
  massInvitation: InvitationLinkDialog_massInvitation$key
}

const InvitationLinkDialog = (props: Props) => {
  const isLoggedIn = useIsAuthenticated()
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
  const pageTitle = teamName ? `${teamName} | Parabol` : 'Join | Parabol'
  const pageName = teamName ? `Join ${teamName}` : 'Join Parabol'
  const metaCopy = teamName
    ? `Join ${teamName} on Parabol, the essential tool for making meetings efficient or replacing them with structured, asynchronous collaboration.`
    : `Join Parabol, the essential tool for making meetings efficient or replacing them with structured, asynchronous collaboration.`
  // biome-ignore lint/correctness/useHookAtTopLevel: legacy
  useDocumentTitle(pageTitle, pageName)
  // biome-ignore lint/correctness/useHookAtTopLevel: legacy
  useMetaTagContent(metaCopy)

  switch (errorType) {
    case 'notFound':
      return <TeamInvitationErrorNotFound isMassInvite />
    case 'expired':
      return <InvitationLinkErrorExpired massInvitation={massInvitation} />
  }
  if (isLoggedIn) {
    return <TeamInvitationAccept invitationToken={token} />
  }
  return <InvitationLinkAuthentication teamName={teamName!} invitationToken={token} />
}

export default withRouter(InvitationLinkDialog)
