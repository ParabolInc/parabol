import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {ToggleTeamPrivacyMutation as TToggleTeamPrivacyMutation} from '../__generated__/ToggleTeamPrivacyMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment ToggleTeamPrivacyMutation_team on ToggleTeamPrivacySuccess {
    team {
      isPublic
    }
  }
`

const mutation = graphql`
  mutation ToggleTeamPrivacyMutation($teamId: ID!) {
    toggleTeamPrivacy(teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ToggleTeamPrivacyMutation_team @relay(mask: false)
    }
  }
`

const ToggleTeamPrivacyMutation: StandardMutation<TToggleTeamPrivacyMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TToggleTeamPrivacyMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default ToggleTeamPrivacyMutation
