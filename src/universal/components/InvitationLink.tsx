import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {InvitationLink_massInvitation} from '__generated__/InvitationLink_massInvitation.graphql'
import TeamInvitationWrapper from './TeamInvitationWrapper'
import TeamInvitationMeetingAbstract from './TeamInvitationMeetingAbstract'
import InvitationLinkDialog from 'universal/components/InvitationLinkDialog'

interface Props {
  massInvitation: InvitationLink_massInvitation
}

function InvitationLink (props: Props) {
  const {massInvitation} = props
  // const {meetingType} = massInvitation
  const meetingType = 'retrospective'
  const Wrapper = meetingType ? TeamInvitationMeetingAbstract : TeamInvitationWrapper
  return (
    <Wrapper>
      <InvitationLinkDialog massInvitation={massInvitation} />
    </Wrapper>
  )
}

export default createFragmentContainer(
  InvitationLink,
  graphql`
    fragment InvitationLink_massInvitation on MassInvitationPayload {
      ...InvitationLinkDialog_massInvitation
      meetingType
    }
  `
)
