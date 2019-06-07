import React from 'react'
import TeamInvitationDialog from './TeamInvitationDialog'
// import TeamInvitationWrapper from './TeamInvitationWrapper'
import TeamInvitationMeetingAbstract from './TeamInvitationMeetingAbstract'

interface Props {
  verifiedInvitation: any
}

function TeamInvitation (props: Props) {
  const {verifiedInvitation} = props
  return (
    <TeamInvitationMeetingAbstract>
      <TeamInvitationDialog verifiedInvitation={verifiedInvitation} />
    </TeamInvitationMeetingAbstract>
  )
}

export default TeamInvitation
