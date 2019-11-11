import * as Sentry from '@sentry/browser'
import {TeamInvitationGoogleSignin_verifiedInvitation} from '../__generated__/TeamInvitationGoogleSignin_verifiedInvitation.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import LoginMutation from '../mutations/LoginMutation'
import Auth0ClientManager from '../utils/Auth0ClientManager'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import {meetingTypeToLabel} from '../utils/meetings/lookups'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import useMutationProps from '../hooks/useMutationProps'
import useDocumentTitle from '../hooks/useDocumentTitle'

interface Props {
  verifiedInvitation: TeamInvitationGoogleSignin_verifiedInvitation
}

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationGoogleSignin = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {history, match} = useRouter<{token: string}>()
  const {params} = match
  const {token: invitationToken} = params
  const {submitting, submitMutation, onError, onCompleted, error} = useMutationProps()
  const {verifiedInvitation} = props
  const {meetingType, user, teamName} = verifiedInvitation
  useDocumentTitle(`Sign in with Google | Team Invitation`)
  const onOAuth = async () => {
    if (!user) return
    const {email} = user
    submitMutation()
    const manager = new Auth0ClientManager()
    let res
    try {
      res = await manager.loginWithGoogle(email)
    } catch (e) {
      onError(e)
      Sentry.captureException(e)
      return
    }
    onCompleted()
    const {idToken} = res
    LoginMutation(atmosphere, {auth0Token: idToken, invitationToken}, {history})
  }

  if (!user) return null
  const {preferredName} = user
  return (
    <InviteDialog>
      <DialogTitle>Welcome back, {preferredName}!</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>You last signed in with Google. </InvitationDialogCopy>
        <InvitationDialogCopy>
          Tap below
          {meetingType
            ? ` to join the ${meetingTypeToLabel[meetingType]} Meeting for: `
            : ' for immediate access to your team: '}
          <TeamName>{teamName}</TeamName>
        </InvitationDialogCopy>
        <InvitationCenteredCopy>
          <GoogleOAuthButtonBlock
            label='Sign in with Google'
            onClick={onOAuth}
            isError={!!error}
            submitting={!!submitting}
          />
        </InvitationCenteredCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default createFragmentContainer(TeamInvitationGoogleSignin, {
  verifiedInvitation: graphql`
    fragment TeamInvitationGoogleSignin_verifiedInvitation on VerifiedInvitationPayload {
      meetingType
      user {
        email
        preferredName
      }
      teamName
    }
  `
})
