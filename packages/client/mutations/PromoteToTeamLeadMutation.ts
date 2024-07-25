import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {PromoteToTeamLeadMutation as TPromoteToTeamLeadMutation} from '../__generated__/PromoteToTeamLeadMutation.graphql'
import {StandardMutation} from '../types/relayMutations'
graphql`
  fragment PromoteToTeamLeadMutation_team on PromoteToTeamLeadPayload {
    team {
      isViewerLead
    }
    oldLeader {
      ...DashboardAvatar_teamMember
      isLead
    }
    newLeader {
      ...DashboardAvatar_teamMember
      isLead
    }
  }
`

const mutation = graphql`
  mutation PromoteToTeamLeadMutation($teamId: ID!, $userId: ID!) {
    promoteToTeamLead(teamId: $teamId, userId: $userId) {
      error {
        message
      }
      ...PromoteToTeamLeadMutation_team
    }
  }
`

const PromoteToTeamLeadMutation: StandardMutation<TPromoteToTeamLeadMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default PromoteToTeamLeadMutation
