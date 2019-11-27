import {TeamInvitationGoogleSignin_verifiedInvitation} from '../__generated__/TeamInvitationGoogleSignin_verifiedInvitation.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import GoogleOAuthButtonBlock from './GoogleOAuthButtonBlock'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import {meetingTypeToLabel} from '../utils/meetings/lookups'
import useRouter from '../hooks/useRouter'
import useDocumentTitle from '../hooks/useDocumentTitle'

interface Props {
  verifiedInvitation: TeamInvitationGoogleSignin_verifiedInvitation
}

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationGoogleSignin = (props: Props) => {
  const {match} = useRouter<{token: string}>()
  const {params} = match
  const {token: invitationToken} = params
  const {verifiedInvitation} = props
  const {meetingType, user, teamName} = verifiedInvitation
  useDocumentTitle(`Sign in with Google | Team Invitation`)

  if (!user) return null
  const {email, preferredName} = user
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
          <GoogleOAuthButtonBlock loginHint={email} invitationToken={invitationToken} />
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
