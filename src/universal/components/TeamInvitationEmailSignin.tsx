import {TeamInvitationEmailSignin_verifiedInvitation} from '__generated__/TeamInvitationEmailSignin_verifiedInvitation.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import Helmet from 'react-helmet'

interface Props {
  verifiedInvitation: TeamInvitationEmailSignin_verifiedInvitation
}

const TeamInvitationEmailSignin = (props: Props) => {
  const {verifiedInvitation} = props
  const {user, teamInvitation, teamName} = verifiedInvitation
  if (!user || !teamInvitation) return null
  const {preferredName} = user
  const {email} = teamInvitation
  return (
    <div>
      <Helmet title={`Sign in | Team Invitation`} />
      <span>Welcome back {preferredName}!</span>
      <span>Enter your password for immediate access to {teamName}</span>
      <input value={email} />
      <input autoFocus type='password' />
      <span>If you forgot your password, click here</span>
    </div>
  )
}

export default createFragmentContainer(
  TeamInvitationEmailSignin,
  graphql`
    fragment TeamInvitationEmailSignin_verifiedInvitation on VerifiedInvitationPayload {
      user {
        preferredName
      }
      teamInvitation {
        email
      }
      teamName
    }
  `
)
