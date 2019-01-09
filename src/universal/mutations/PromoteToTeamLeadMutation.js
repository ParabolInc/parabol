import {commitMutation} from 'react-relay'

graphql`
  fragment PromoteToTeamLeadMutation_team on PromoteToTeamLeadPayload {
    team {
      isLead
    }
    oldLeader {
      isLead
    }
    newLeader {
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
