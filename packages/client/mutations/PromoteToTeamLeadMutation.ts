import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {PromoteToTeamLeadMutation as TPromoteToTeamLeadMutation} from '../__generated__/PromoteToTeamLeadMutation.graphql'
graphql`
  fragment PromoteToTeamLeadMutation_team on PromoteToTeamLeadPayload {
    team {
      isLead
    }
    oldLeader {
      ...DashboardAvatars_teamMember
      isLead
    }
    newLeader {
      ...DashboardAvatars_teamMember
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
