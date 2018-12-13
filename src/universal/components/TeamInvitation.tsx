import {TeamInvitation_verifiedInvitation} from '__generated__/TeamInvitation_verifiedInvitation.graphql'
import {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'

interface Props {
  verifiedInvitation: TeamInvitation_verifiedInvitation
}

class TeamInvitation extends Component<Props> {
  componentDidMount () {
    // if logged in, call the accept mutation
    // if logged out
    // if user
    // if google
    // else if not google
    // else if not user
    // if google
    // else if not google
  }

  render () {
    return null
    // const {verifiedInvitation} = this.props
    // if logged in, just redirect
    // if (verifiedInvitation.errorType) {
    //   switch (verifiedInvitation.errorType) {
    //     case 'accepted':
    //       return <Redirect to='/me' />
    //   }
    // }
  }
}

export default createFragmentContainer(
  TeamInvitation,
  graphql`
    fragment TeamInvitation_verifiedInvitation on VerifiedInvitationPayload {
      teamInvitation {
        email
        team {
          name
        }
      }
      errorType
      isGoogle
      user {
        preferredName
      }
    }
  `
)
