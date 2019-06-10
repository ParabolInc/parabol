import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
// import {TeamInvitation_verifiedInvitation} from '__generated__/TeamInvitation_verifiedInvitation.graphql'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import TeamInvitationDialog from './TeamInvitationDialog'
import TeamInvitationWrapper from './TeamInvitationWrapper'
import TeamInvitationMeetingAbstract from './TeamInvitationMeetingAbstract'

interface Props extends WithAtmosphereProps {
  verifiedInvitation: any
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
  withAtmosphere(TeamInvitation),
  graphql`
    fragment TeamInvitation_verifiedInvitation on VerifiedInvitationPayload {
      meetingType
    }
  `
)
