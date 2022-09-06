import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {TeamInvitationErrorAccepted_verifiedInvitation} from '../__generated__/TeamInvitationErrorAccepted_verifiedInvitation.graphql'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'
import StyledLink from './StyledLink'

interface Props {
  verifiedInvitation: TeamInvitationErrorAccepted_verifiedInvitation
}

const InlineCopy = styled(InvitationDialogCopy)({
  display: 'inline-block'
})

const TeamInvitationErrorAccepted = (props: Props) => {
  const {verifiedInvitation} = props

  //FIXME i18n: Team Invitation
  //FIXME i18n: Visit the Team Dashboard
  const {t} = useTranslation()

  const {meetingId, meetingName, teamInvitation, teamName} = verifiedInvitation
  useDocumentTitle(`Token already accepted | Team Invitation`, 'Team Invitation')
  if (!teamInvitation || teamName === null) return null
  const {teamId} = teamInvitation
  return (
    <InviteDialog>
      <DialogTitle>{t('TeamInvitationErrorAccepted.InvitationAlreadyAccepted')}</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          {t('TeamInvitationErrorAccepted.TheInvitationTo')}
          {teamName}
          {t('TeamInvitationErrorAccepted.HasAlreadyBeenRedeemed.')}
        </InvitationDialogCopy>
        {meetingName ? (
          <>
            <StyledLink to={`/meet/${meetingId}`} title={`Join ${meetingName}`}>
              {t('TeamInvitationErrorAccepted.Join')}
              {meetingName}
            </StyledLink>{' '}
            <InlineCopy>{t('TeamInvitationErrorAccepted.InProgress…')}</InlineCopy>
          </>
        ) : (
          <>
            <InlineCopy>{t('TeamInvitationErrorAccepted.VisitThe')}</InlineCopy>{' '}
            <StyledLink to={`/team/${teamId}`} title='Visit the Team Dashboard'>
              {t('TeamInvitationErrorAccepted.TeamDashboard')}
            </StyledLink>
          </>
        )}
      </DialogContent>
    </InviteDialog>
  )
}

export default createFragmentContainer(TeamInvitationErrorAccepted, {
  verifiedInvitation: graphql`
    fragment TeamInvitationErrorAccepted_verifiedInvitation on VerifiedInvitationPayload {
      meetingId
      meetingName
      teamName
      teamInvitation {
        teamId
      }
    }
  `
})
