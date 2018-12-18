import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {TeamInvitationErrorExpired_verifiedInvitation} from '__generated__/TeamInvitationErrorExpired_verifiedInvitation.graphql'
import Helmet from 'react-helmet'

interface Props {
  verifiedInvitation: TeamInvitationErrorExpired_verifiedInvitation
}

const TeamInvitationErrorExpired = (props: Props) => {
  const {verifiedInvitation} = props
  const {teamName, inviterName, inviterEmail} = verifiedInvitation
  return (
    <div>
      <Helmet title={`Token Expired | Team Invitation`} />
      <span>Your invitation to {teamName} has expired!</span>
      <span>
        Reach out to {inviterName} at {inviterEmail} to request a new one
      </span>
    </div>
  )
}

export default createFragmentContainer(
  TeamInvitationErrorExpired,
  graphql`
    fragment TeamInvitationErrorExpired_verifiedInvitation on VerifiedInvitationPayload {
      teamName
      inviterName
      inviterEmail
    }
  `
)
