import React, {Component} from 'react'
import AddTeamMemberModalBoundary from './AddTeamMemberModalBoundary'

interface Props {
  successfulInvitations: Array<string>
}

class AddTeamMemberModalSuccess extends Component<Props> {
  render () {
    const {successfulInvitations} = this.props
    return (
      <AddTeamMemberModalBoundary>
        <span>Success!</span>
        <span>An invitation has been sent to</span>
        <ul>
          {successfulInvitations.map((email) => {
            return <li key={email}>{email}</li>
          })}
        </ul>
      </AddTeamMemberModalBoundary>
    )
  }
}

export default AddTeamMemberModalSuccess
