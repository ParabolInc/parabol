import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {JoinTeamMutation as TJoinTeamMutation} from '../__generated__/JoinTeamMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment JoinTeamMutation_team on JoinTeamSuccess {
    team {
      ...DashNavListTeam
      ...MeetingsDashActiveMeetings
      id
      name
      isPaid
      activeMeetings {
        id
      }
      organization {
        id
        name
        ...DashNavList_organization
      }
      ...DashNavListTeam
      ...PublicTeamsFrag_team
      teamMembers {
        id
        preferredName
        userId
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
