import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router'
import {TeamInvitationErrorAccepted_verifiedInvitation} from '__generated__/TeamInvitationErrorAccepted_verifiedInvitation.graphql'

interface Props extends RouteComponentProps<{}> {
  verifiedInvitation: TeamInvitationErrorAccepted_verifiedInvitation
}

const TeamInvitationErrorAccepted = (props: Props) => {
  const {history, verifiedInvitation} = props
  const {teamInvitation} = verifiedInvitation
  if (!teamInvitation) return null
  const {teamId} = teamInvitation
  return (
    <div>
      <span>Your token has already been redeemed!</span>
      <span onClick={() => history.replace(`/team/${teamId}`)}>Click here</span>
      <span> to head to the team dashboard</span>
    </div>
  )
}

export default createFragmentContainer(
  withRouter(TeamInvitationErrorAccepted),
  graphql`
    fragment TeamInvitationErrorAccepted_verifiedInvitation on VerifiedInvitationPayload {
      teamInvitation {
        teamId
      }
    }
  `
)
