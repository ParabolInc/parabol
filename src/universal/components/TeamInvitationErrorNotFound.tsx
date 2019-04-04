import React from 'react'
import BasicCard from './BasicCard'
import DialogContent from './DialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import DialogTitle from './DialogTitle'
import Helmet from 'react-helmet'

const TeamInvitationErrorNotFound = () => {
  return (
    <BasicCard>
      <Helmet title={`Token not found | Team Invitation`} />
      <DialogTitle>Invalid Invitation</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>The invitation token is not valid.</InvitationDialogCopy>
        <InvitationDialogCopy>Try copying the link from your email again.</InvitationDialogCopy>
      </DialogContent>
    </BasicCard>
  )
}

export default TeamInvitationErrorNotFound
