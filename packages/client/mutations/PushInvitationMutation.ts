import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {OnNextHandler, SimpleMutation} from '../types/relayMutations'
import {PushInvitationMutation as TPushInvitationMutation} from '../__generated__/PushInvitationMutation.graphql'
import {PushInvitationMutation_team$data} from '../__generated__/PushInvitationMutation_team.graphql'
import DenyPushInvitationMutation from './DenyPushInvitationMutation'
import InviteToTeamMutation from './InviteToTeamMutation'

graphql`
  fragment PushInvitationMutation_team on PushInvitationPayload {
    meetingId
    user {
      id
      preferredName
      email
    }
    team {
      id
      name
    }
  }
`

const mutation = graphql`
  mutation PushInvitationMutation($teamId: ID!, $meetingId: ID) {
    pushInvitation(teamId: $teamId, meetingId: $meetingId) {
      error {
        message
        title
      }
    }
  }
`

export const pushInvitationTeamOnNext: OnNextHandler<PushInvitationMutation_team$data> = (
  payload,
  {atmosphere}
) => {
  const {user, team, meetingId} = payload
  if (!user || !team) return
  const {preferredName, email, id: userId} = user
  const {name: teamName, id: teamId} = team
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 0,
    key: `pushInvitation:${teamId}:${userId}`,
    message: `${preferredName} (${email}) is requesting to join ${teamName}.`,
    action: {
      label: 'Accept',
      callback: () => {
        InviteToTeamMutation(atmosphere, {meetingId, teamId, invitees: [email]}, {})
      }
    },
    secondaryAction: {
      label: 'Deny',
      callback: () => {
        DenyPushInvitationMutation(atmosphere, {teamId, userId})
      }
    }
  })
}

const PushInvitationMutation: SimpleMutation<TPushInvitationMutation> = (atmosphere, variables) => {
  return commitMutation<TPushInvitationMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default PushInvitationMutation
