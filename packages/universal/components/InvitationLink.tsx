import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {InvitationLink_massInvitation} from '__generated__/InvitationLink_massInvitation.graphql'
import TeamInvitationMeetingAbstract from './TeamInvitationMeetingAbstract'
import InvitationLinkDialog from 'universal/components/InvitationLinkDialog'

interface Props {
  massInvitation: InvitationLink_massInvitation
}

function InvitationLink (props: Props) {
  const {massInvitation} = props
  // the meeting background is prettier than the plain one, so let's always use it
  return (
    <TeamInvitationMeetingAbstract>
      <InvitationLinkDialog massInvitation={massInvitation} />
    </TeamInvitationMeetingAbstract>
  )
}

export default createFragmentContainer(InvitationLink, {
  massInvitation: graphql`
    fragment InvitationLink_massInvitation on MassInvitationPayload {
      ...InvitationLinkDialog_massInvitation
    }
  `
})
