import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment PromoteToTeamLeadMutation_team on PromoteToTeamLeadPayload {
    team {
      isLead
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
  mutation PromoteToTeamLeadMutation($teamMemberId: ID!) {
    promoteToTeamLead(teamMemberId: $teamMemberId) {
      error {
        message
      }
      ...PromoteToTeamLeadMutation_team
    }
  }
`

const PromoteToTeamLeadMutation = (environment, teamMemberId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamMemberId},
    onCompleted,
    onError
  })
}

export default PromoteToTeamLeadMutation
