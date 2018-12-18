import React from 'react'
import Helmet from 'react-helmet'

const TeamInvitationErrorNotFound = () => {
  return (
    <div>
      <Helmet title={`Token not found | Team Invitation`} />
      <span>Your invitation token is not valid. Try copying the link from your email again</span>
    </div>
  )
}

export default TeamInvitationErrorNotFound
