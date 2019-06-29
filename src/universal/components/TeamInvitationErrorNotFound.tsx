import React from 'react'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import useDocumentTitle from 'universal/hooks/useDocumentTitle'

const TeamInvitationErrorNotFound = () => {
  useDocumentTitle(`Token not found | Team Invitation`)
  return (
    <InviteDialog>
      <DialogTitle>Invalid Invitation</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>The invitation token is not valid.</InvitationDialogCopy>
        <InvitationDialogCopy>Try copying the link from your email again.</InvitationDialogCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationErrorNotFound
