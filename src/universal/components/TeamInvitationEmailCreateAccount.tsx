import {TeamInvitationEmailCreateAccount_verifiedInvitation} from '__generated__/TeamInvitationEmailCreateAccount_verifiedInvitation.graphql'
import React from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import BasicCard from './BasicCard'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'
import AuthPrivacyFooter from 'universal/components/AuthPrivacyFooter'

interface Props {
  verifiedInvitation: TeamInvitationEmailCreateAccount_verifiedInvitation
}

const StyledDialog = styled(BasicCard)({
  maxWidth: 356
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationEmailCreateAccount = (props: Props) => {
  const {verifiedInvitation} = props
  const {teamName, teamInvitation} = verifiedInvitation
  if (!teamInvitation) return null
  const {email} = teamInvitation
  return (
    <StyledDialog>
      <Helmet title={`Sign up | Team Invitation`} />
      <InvitationDialogTitle>Welcome!</InvitationDialogTitle>
      <InvitationDialogContent>
        <InvitationDialogCopy>
          Choose a password for immediate access to your team: <TeamName>{teamName}</TeamName>
        </InvitationDialogCopy>
        <InvitationCenteredCopy>
          <EmailPasswordAuthForm email={email} isPrimary />
        </InvitationCenteredCopy>
        <AuthPrivacyFooter />
      </InvitationDialogContent>
    </StyledDialog>
  )
}

export default createFragmentContainer(
  TeamInvitationEmailCreateAccount,
  graphql`
    fragment TeamInvitationEmailCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
      teamInvitation {
        email
      }
      teamName
    }
  `
)
