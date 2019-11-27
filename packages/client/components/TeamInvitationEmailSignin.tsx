import {TeamInvitationEmailSignin_verifiedInvitation} from '../__generated__/TeamInvitationEmailSignin_verifiedInvitation.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import ForgotPasswordOneClick from './ForgotPasswordOneClick'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import {meetingTypeToLabel} from '../utils/meetings/lookups'
import useDocumentTitle from '../hooks/useDocumentTitle'

interface Props {
  invitationToken: string
  verifiedInvitation: TeamInvitationEmailSignin_verifiedInvitation
}

const StyledDialog = styled(InviteDialog)({
  maxWidth: 356
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationEmailSignin = (props: Props) => {
  const {invitationToken, verifiedInvitation} = props
  const {meetingType, user, teamInvitation, teamName} = verifiedInvitation
  useDocumentTitle(`Sign in | Team Invitation`)
  if (!user || !teamInvitation) return null
  const {preferredName} = user
  const {email} = teamInvitation
  return (
    <StyledDialog>
      <DialogTitle>Welcome back, {preferredName}!</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          Enter your password
          {meetingType
            ? ` to join the ${meetingTypeToLabel[meetingType]} Meeting for: `
            : ' for immediate access to your team: '}
          <TeamName>{teamName}</TeamName>
        </InvitationDialogCopy>
        <InvitationCenteredCopy>
          <EmailPasswordAuthForm
            email={email}
            isPrimary
            isSignin
            invitationToken={invitationToken}
          />
          <ForgotPasswordOneClick email={email} />
        </InvitationCenteredCopy>
      </DialogContent>
    </StyledDialog>
  )
}

export default createFragmentContainer(TeamInvitationEmailSignin, {
  verifiedInvitation: graphql`
    fragment TeamInvitationEmailSignin_verifiedInvitation on VerifiedInvitationPayload {
      meetingType
      user {
        preferredName
      }
      teamInvitation {
        email
      }
      teamName
    }
  `
})
