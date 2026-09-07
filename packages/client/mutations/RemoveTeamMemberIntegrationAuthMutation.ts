import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RemoveTeamMemberIntegrationAuthMutation as TRemoveTeamMemberIntegrationAuthMutation} from '../__generated__/RemoveTeamMemberIntegrationAuthMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment RemoveTeamMemberIntegrationAuthMutation_team on RemoveTeamMemberIntegrationAuthSuccess {
    teamMember {
      ...useIsIntegrated_teamMember
      ...GcalProviderRowTeamMember
      services {
        ...IntegrationServiceProviderRow_service
      }
      integrations {
        ...MattermostProviderRowTeamMemberIntegrations
        ...MSTeamsProviderRowTeamMemberIntegrations
        gitlab {
          auth {
            isActive
            provider {
              id
            }
          }
        }
        linear {
          auth {
            isActive
          }
        }
        jiraServer {
          auth {
            isActive
          }
        }
        gmeet {
          isActive
        }
        zoom {
          isActive
        }
        atlassian {
          accessToken
          scope
        }
        github {
          accessToken
          login
        }
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveTeamMemberIntegrationAuthMutation(
    $service: IntegrationProviderServiceEnum!
    $teamId: ID!
  ) {
    removeTeamMemberIntegrationAuth(service: $service, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }

      ...RemoveTeamMemberIntegrationAuthMutation_team @relay(mask: false)
    }
  }
`

const RemoveTeamMemberIntegrationAuthMutation: StandardMutation<
  TRemoveTeamMemberIntegrationAuthMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TRemoveTeamMemberIntegrationAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default RemoveTeamMemberIntegrationAuthMutation
