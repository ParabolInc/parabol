import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {TeamInvitation_verifiedInvitation} from '__generated__/TeamInvitation_verifiedInvitation.graphql'
import TeamInvitationDialog from './TeamInvitationDialog'
import TeamInvitationWrapper from './TeamInvitationWrapper'
import TeamInvitationMeetingAbstract from './TeamInvitationMeetingAbstract'

interface Props {
  verifiedInvitation: TeamInvitation_verifiedInvitation
}

function TeamInvitation (props: Props) {
  const {verifiedInvitation} = props
  const {meetingType} = verifiedInvitation
  const Wrapper = meetingType ? TeamInvitationMeetingAbstract : TeamInvitationWrapper
  return (
    <Wrapper>
      <TeamInvitationDialog verifiedInvitation={verifiedInvitation} />
    </Wrapper>
  )
}

export default createFragmentContainer(
  TeamInvitation,
  graphql`
    fragment TeamInvitation_verifiedInvitation on VerifiedInvitationPayload {
      ...TeamInvitationDialog_verifiedInvitation
      meetingType
    }
  `
)
