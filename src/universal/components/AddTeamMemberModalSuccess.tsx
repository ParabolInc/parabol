import React, {Component} from 'react'
import styled from 'react-emotion'
import AddTeamMemberModalBoundary from './AddTeamMemberModalBoundary'
import InvitationDialogContent from './InvitationDialogContent'
import InvitationDialogTitle from './InvitationDialogTitle'

interface Props {
  closePortal: () => void
  successfulInvitations: Array<string>
}

const UL = styled('ul')({
  padding: '0 0 0 1rem'
})

const LI = styled('li')({
  display: 'block',
  lineHeight: '1.5rem'
})

class AddTeamMemberModalSuccess extends Component<Props> {
  componentDidMount () {
    setTimeout(() => {
      this.props.closePortal()
    }, 5000)
  }
  render () {
    const {successfulInvitations} = this.props
    return (
      <AddTeamMemberModalBoundary>
        <InvitationDialogTitle>Success!</InvitationDialogTitle>
        <InvitationDialogContent>
          <span>An invitation has been sent to</span>
          {successfulInvitations.length === 1 ? <span> {successfulInvitations[0]}.</span> : ':'}
          {successfulInvitations.length > 1 && (
            <UL>
              {successfulInvitations.map((email) => {
                return <LI key={email}>{email}</LI>
              })}
            </UL>
          )}
        </InvitationDialogContent>
      </AddTeamMemberModalBoundary>
    )
  }
}

export default AddTeamMemberModalSuccess
