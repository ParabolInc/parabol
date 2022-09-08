import React from 'react'
import {useTranslation} from 'react-i18next'
import useDocumentTitle from '../hooks/useDocumentTitle'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

interface Props {
  isMassInvite?: boolean
}
const TeamInvitationErrorNotFound = (props: Props) => {
  const {isMassInvite} = props

  const {t} = useTranslation()

  useDocumentTitle(
    t('TeamInvitationErrorNotFound.TokenNotFoundTeamInvitation', {}),
    t('TeamInvitationErrorNotFound.TeamInvitation')
  )
  const tip = isMassInvite
    ? t('TeamInvitationErrorNotFound.TryRequestingAnotherLink')
    : t('TeamInvitationErrorNotFound.TryCopyingTheLinkFromYourEmailAgain')
  return (
    <InviteDialog>
      <DialogTitle>{t('TeamInvitationErrorNotFound.InvalidInvitation')}</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          {t('TeamInvitationErrorNotFound.TheInvitationTokenIsNotValid')}
        </InvitationDialogCopy>
        <InvitationDialogCopy>{tip}</InvitationDialogCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationErrorNotFound
