import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {EndTeamPromptMutation as TEndTeamPromptMutation} from '../__generated__/EndTeamPromptMutation.graphql'

graphql`
  fragment EndTeamPromptMutation_team on EndTeamPromptSuccess {
    meeting {
      id
      endedAt
      teamId
    }
    team {
      id
      activeMeetings {
        id
      }
      agendaItems {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation EndTeamPromptMutation($meetingId: ID!) {
    endTeamPrompt(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...EndTeamPromptMutation_team @relay(mask: false)
    }
  }
`

const EndTeamPromptMutation: StandardMutation<TEndTeamPromptMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TEndTeamPromptMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default EndTeamPromptMutation
