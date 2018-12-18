import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {TeamInvitationGoogleSignin_verifiedInvitation} from '__generated__/TeamInvitationGoogleSignin_verifiedInvitation.graphql'
import Helmet from 'react-helmet'

interface Props {
  verifiedInvitation: TeamInvitationGoogleSignin_verifiedInvitation
}

const TeamInvitationGoogleSignin = (props: Props) => {
  const {verifiedInvitation} = props
  const {user, teamName} = verifiedInvitation
  if (!user) return null
  const {preferredName} = user
  return (
    <div>
      <Helmet title={`Sign in with Google | Team Invitation`} />
      <span>Welcome back {preferredName}!</span>
      <span>You last signed in using Google. Click below for immediate access to {teamName}</span>
      <button>Google OAuth</button>
    </div>
  )
}

export default createFragmentContainer(
  TeamInvitationGoogleSignin,
  graphql`
    fragment TeamInvitationGoogleSignin_verifiedInvitation on VerifiedInvitationPayload {
      user {
        preferredName
      }
      teamName
    }
  `
)
