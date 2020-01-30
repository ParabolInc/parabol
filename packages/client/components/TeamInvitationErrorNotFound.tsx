import React from 'react'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import useDocumentTitle from '../hooks/useDocumentTitle'

interface Props {
  isMassInvite?: boolean
}
const TeamInvitationErrorNotFound = (props: Props) => {
  const {isMassInvite} = props
  useDocumentTitle(`Token not found | Team Invitation`, 'Team Invitation')
  const tip = isMassInvite
    ? 'Try requesting another link.'
    : 'Try copying the link from your email again.'
  return (
    <InviteDialog>
      <DialogTitle>Invalid Invitation</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>The invitation token is not valid.</InvitationDialogCopy>
        <InvitationDialogCopy>{tip}</InvitationDialogCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationErrorNotFound
