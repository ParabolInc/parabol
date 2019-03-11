import React from 'react'
import TeamInvitationDialog from './TeamInvitationDialog'
import TeamInvitationWrapper from './TeamInvitationWrapper'

interface Props {
  verifiedInvitation: any
}

function TeamInvitation (props: Props) {
  const {verifiedInvitation} = props
  return (
    <TeamInvitationWrapper>
      <TeamInvitationDialog verifiedInvitation={verifiedInvitation} />
    </TeamInvitationWrapper>
  )
}

export default TeamInvitation
