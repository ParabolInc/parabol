import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {TeamInvitationEmailCreateAccount_verifiedInvitation} from '../__generated__/TeamInvitationEmailCreateAccount_verifiedInvitation.graphql'
import AuthPrivacyFooter from './AuthPrivacyFooter'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import EmailPasswordAuthForm from './EmailPasswordAuthForm'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

interface Props {
  verifiedInvitation: TeamInvitationEmailCreateAccount_verifiedInvitation
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
  const {invitationToken, verifiedInvitation} = props

  const {t} = useTranslation()

  const {meetingName, teamName, teamInvitation} = verifiedInvitation
  useDocumentTitle(
    t('TeamInvitationEmailCreateAccount.SignUpTeamInvitation', {}),
    t('TeamInvitationEmailCreateAccount.SignUp')
  )
  if (!teamInvitation) return null
  const {email} = teamInvitation
  return (
    <StyledDialog>
      <DialogTitle>
        {meetingName
          ? t('TeamInvitationEmailCreateAccount.JoinMeetingName', {
              meetingName
            })
          : t('TeamInvitationEmailCreateAccount.JoinTeam')}
      </DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          {t('TeamInvitationEmailCreateAccount.ChooseAPasswordForImmediateAccess')}
          {meetingName
            ? t('TeamInvitationEmailCreateAccount.ToTheTeamMeetingFor')
            : t('TeamInvitationEmailCreateAccount.ToYourTeam')}
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

export default createFragmentContainer(TeamInvitationEmailCreateAccount, {
  verifiedInvitation: graphql`
    fragment TeamInvitationEmailCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
      meetingName
      teamInvitation {
        email
      }
      teamName
    }
  `
})
