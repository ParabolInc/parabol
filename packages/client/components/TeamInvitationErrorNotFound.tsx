import React from 'react'
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
