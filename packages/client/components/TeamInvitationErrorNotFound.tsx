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

  //FIXME i18n: Team Invitation
  //FIXME i18n: Try requesting another link.
  //FIXME i18n: Try copying the link from your email again.
  const {t} = useTranslation()

  useDocumentTitle(`Token not found | Team Invitation`, 'Team Invitation')
  const tip = isMassInvite
    ? 'Try requesting another link.'
    : 'Try copying the link from your email again.'
  return (
    <InviteDialog>
      <DialogTitle>{t('TeamInvitationErrorNotFound.InvalidInvitation')}</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          {t('TeamInvitationErrorNotFound.TheInvitationTokenIsNotValid.')}
        </InvitationDialogCopy>
        <InvitationDialogCopy>{tip}</InvitationDialogCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationErrorNotFound
