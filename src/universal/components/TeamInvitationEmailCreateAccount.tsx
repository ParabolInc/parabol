import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {TeamInvitationEmailCreateAccount_verifiedInvitation} from '__generated__/TeamInvitationEmailCreateAccount_verifiedInvitation.graphql'

interface Props {
  verifiedInvitation: TeamInvitationEmailCreateAccount_verifiedInvitation
}

const TeamInvitationEmailCreateAccount = (props: Props) => {
  const {verifiedInvitation} = props
  const {teamName, teamInvitation} = verifiedInvitation
  if (!teamInvitation) return null
  const {email} = teamInvitation
  return (
    <div>
      <span>Welcome!</span>
      <span>Enter your password for immediate access to {teamName}</span>
      <input value={email} />
      <input autoFocus type='password' />
    </div>
  )
}

export default createFragmentContainer(
  TeamInvitationEmailCreateAccount,
  graphql`
    fragment TeamInvitationEmailCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
      teamInvitation {
        email
      }
      teamName
    }
  `
)
