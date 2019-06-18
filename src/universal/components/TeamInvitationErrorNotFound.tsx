import React from 'react'
import InviteDialog from './InviteDialog'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import Helmet from 'react-helmet'

const TeamInvitationErrorNotFound = () => {
  return (
    <InviteDialog>
      <Helmet title={`Token not found | Team Invitation`} />
      <DialogTitle>Invalid Invitation</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>The invitation token is not valid.</InvitationDialogCopy>
        <InvitationDialogCopy>Try copying the link from your email again.</InvitationDialogCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationErrorNotFound
