import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {PALETTE} from '../styles/paletteV3'
import {TeamInvitationErrorExpired_verifiedInvitation} from '../__generated__/TeamInvitationErrorExpired_verifiedInvitation.graphql'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

interface Props {
  verifiedInvitation: TeamInvitationErrorExpired_verifiedInvitation
}

const StyledEmailLink = styled('a')({
  color: PALETTE.SKY_500
})

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const TeamInvitationErrorExpired = (props: Props) => {
  const {verifiedInvitation} = props

  const {t} = useTranslation()

  const {teamName, inviterName, inviterEmail} = verifiedInvitation
  useDocumentTitle(
    t('TeamInvitationErrorExpired.TokenExpiredTeamInvitation', {}),
    t('TeamInvitationErrorExpired.TeamInvitation')
  )
  return (
    <InviteDialog>
      <DialogTitle>{t('TeamInvitationErrorExpired.InvitationExpired')}</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          {t('TeamInvitationErrorExpired.TheInvitationTo')}
          <TeamName>{teamName}</TeamName>
          {t('TeamInvitationErrorExpired.HasExpired')}
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          {t('TeamInvitationErrorExpired.ReachOutTo')}
          {inviterName}
          {t('TeamInvitationErrorExpired.At')}{' '}
          <StyledEmailLink
            href={t('TeamInvitationErrorExpired.MailtoInviterEmail', {
              inviterEmail
            })}
            title={t('TeamInvitationErrorExpired.EmailInviterEmail', {
              inviterEmail
            })}
          >
            {inviterEmail}
          </StyledEmailLink>
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          {t('TeamInvitationErrorExpired.ToRequestANewOne')}
        </InvitationDialogCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default createFragmentContainer(TeamInvitationErrorExpired, {
  verifiedInvitation: graphql`
    fragment TeamInvitationErrorExpired_verifiedInvitation on VerifiedInvitationPayload {
      teamName
      inviterName
      inviterEmail
    }
  `
})
