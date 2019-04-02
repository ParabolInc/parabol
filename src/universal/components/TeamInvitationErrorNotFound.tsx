import React from 'react'
import BasicCard from './BasicCard'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogCopy from './InvitationDialogCopy'
import InvitationDialogTitle from './InvitationDialogTitle'
import Helmet from 'react-helmet'

const TeamInvitationErrorNotFound = () => {
  return (
    <BasicCard>
      <Helmet title={`Token not found | Team Invitation`} />
      <InvitationDialogTitle>Invalid Invitation</InvitationDialogTitle>
      <InvitationDialogContent>
        <InvitationDialogCopy>The invitation token is not valid.</InvitationDialogCopy>
        <InvitationDialogCopy>Try copying the link from your email again.</InvitationDialogCopy>
      </InvitationDialogContent>
    </BasicCard>
  )
}

export default TeamInvitationErrorNotFound
