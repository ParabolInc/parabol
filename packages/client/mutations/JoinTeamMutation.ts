import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {JoinTeamMutation as TJoinTeamMutation} from '../__generated__/JoinTeamMutation.graphql'
import {JoinTeamMutation_team$data} from '../__generated__/JoinTeamMutation_team.graphql'
import {OnNextHandler, StandardMutation} from '../types/relayMutations'

graphql`
  fragment JoinTeamMutation_team on JoinTeamSuccess {
    team {
      id
      name
      isPaid
      organization {
        id
        name
      }
      ...PublicTeamsFrag_team
    }
    teamMember {
      id
      user {
        id
        preferredName
      }
    }
  }
`

const mutation = graphql`
  mutation JoinTeamMutation($teamId: ID!) {
    joinTeam(teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...JoinTeamMutation_team @relay(mask: false)
    }
  }
`

export const joinTeamTeamOnNext: OnNextHandler<JoinTeamMutation_team$data> = (
  payload,
  {atmosphere}
) => {
  const {team, teamMember} = payload
  const {viewerId} = atmosphere
  const {name: teamName} = team
  const {user} = teamMember
  const {id: userId, preferredName} = user

  if (userId !== viewerId) {
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: `joinTeam:${team.id}:${userId}`,
      autoDismiss: 5,
      message: `${preferredName} just joined team ${teamName}`
    })
  }
}

const JoinTeamMutation: StandardMutation<TJoinTeamMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TJoinTeamMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default JoinTeamMutation
