import React from 'react'
import InvitationDialog from './InvitationDialog'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'
import Helmet from 'react-helmet'

const TeamInvitationErrorNotFound = () => {
  return (
    <InvitationDialog>
      <Helmet title={`Token not found | Team Invitation`} />
      <InvitationDialogTitle>Invalid Invitation</InvitationDialogTitle>
      <InvitationDialogContent>
        <InvitationDialogCopy>The invitation token is not valid.</InvitationDialogCopy>
        <InvitationDialogCopy>Try copying the link from your email again.</InvitationDialogCopy>
      </InvitationDialogContent>
    </InvitationDialog>
  )
}

export default TeamInvitationErrorNotFound
