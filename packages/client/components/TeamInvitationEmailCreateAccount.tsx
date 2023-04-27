import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {TeamInvitationEmailCreateAccount_verifiedInvitation$key} from '../__generated__/TeamInvitationEmailCreateAccount_verifiedInvitation.graphql'
import AuthPrivacyFooter from './AuthPrivacyFooter'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

interface Props {
  verifiedInvitation: TeamInvitationEmailCreateAccount_verifiedInvitation$key
  invitationToken: string
}

const StyledDialog = styled(InviteDialog)({
  maxWidth: 356
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationEmailCreateAccount = (props: Props) => {
  const {invitationToken, verifiedInvitation: verifiedInvitationRef} = props
  const verifiedInvitation = useFragment(
    graphql`
      fragment TeamInvitationEmailCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
        meetingName
        teamInvitation {
          email
        }
        teamName
      }
    `,
    verifiedInvitationRef
  )
  const {meetingName, teamName, teamInvitation} = verifiedInvitation
  useDocumentTitle(`Sign up | Team Invitation`, 'Sign Up')
  if (!teamInvitation) return null
  const {email} = teamInvitation
  return (
    <StyledDialog>
      <DialogTitle>{meetingName ? `Join ${meetingName}` : 'Join Team'}</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          Choose a password for immediate access
          {meetingName ? ' to the team meeting for: ' : ' to your team: '}
          <TeamName>{teamName}</TeamName>
        </InvitationDialogCopy>
        <InvitationCenteredCopy>
          <EmailPasswordAuthForm email={email} isPrimary invitationToken={invitationToken} />
        </InvitationCenteredCopy>
        <AuthPrivacyFooter />
      </DialogContent>
    </StyledDialog>
  )
}

export default TeamInvitationEmailCreateAccount
