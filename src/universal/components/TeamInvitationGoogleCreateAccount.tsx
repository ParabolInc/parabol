import {TeamInvitationGoogleCreateAccount_verifiedInvitation} from '__generated__/TeamInvitationGoogleCreateAccount_verifiedInvitation.graphql'
import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import Helmet from 'react-helmet'

interface Props {
  verifiedInvitation: TeamInvitationGoogleCreateAccount_verifiedInvitation
}

interface State {
  isEmailFallback: boolean
}

class TeamInvitationGoogleCreateAccount extends Component<Props, State> {
  state = {
    isEmailFallback: false
  }
  useEmail = () => {
    this.setState({
      isEmailFallback: true
    })
  }

  render () {
    const {verifiedInvitation} = this.props
    const {isEmailFallback} = this.state
    const {teamInvitation, teamName} = verifiedInvitation
    if (!teamInvitation) return null
    const {email} = teamInvitation
    return (
      <div>
        <Helmet title={`Sign up with Google | Team Invitation`} />
        <span>Welcome!</span>
        <span>
          It looks like your email is hosted by Google. Sign up below for immediate access to{' '}
          {teamName}
        </span>
        <button>Google OAuth</button>
        <span>If you'd like to create an account without Google, </span>
        <span onClick={this.useEmail}>click here</span>
        {isEmailFallback && (
          <React.Fragment>
            <input value={email} />
            <input autoFocus type='password' />
          </React.Fragment>
        )}
      </div>
    )
  }
}

export default createFragmentContainer(
  TeamInvitationGoogleCreateAccount,
  graphql`
    fragment TeamInvitationGoogleCreateAccount_verifiedInvitation on VerifiedInvitationPayload {
      teamInvitation {
        email
      }
      teamName
    }
  `
)
