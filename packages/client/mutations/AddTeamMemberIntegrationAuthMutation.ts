import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {AddTeamMemberIntegrationAuthMutation as TAddTeamMemberIntegrationAuthMutation} from '../__generated__/AddTeamMemberIntegrationAuthMutation.graphql'
import type {AddTeamMemberIntegrationAuthMutation_notification$data} from '../__generated__/AddTeamMemberIntegrationAuthMutation_notification.graphql'
import type {SharedUpdater, StandardMutation} from '../types/relayMutations'

graphql`
  fragment AddTeamMemberIntegrationAuthMutation_notification on AddTeamMemberIntegrationAuthPayload {
    service
    teamMember {
      ...useIsIntegrated_teamMember
      services {
        ...IntegrationServiceProviderRow_service
        ...usePersistIntegrationSearchQueryMutation_service @relay(mask: false)
      }
      integrations {
        ...MattermostProviderRowTeamMemberIntegrations
        ...MSTeamsProviderRowTeamMemberIntegrations
        gcal {
          auth {
            id
            providerId
          }
        }
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
          isActive
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
  mutation AddTeamMemberIntegrationAuthMutation(
    $providerId: ID!
    $oauthCodeOrPat: ID
    $oauthVerifier: ID
    $teamId: ID!
  ) {
    addTeamMemberIntegrationAuth(
      providerId: $providerId
      oauthCodeOrPat: $oauthCodeOrPat
      oauthVerifier: $oauthVerifier
      teamId: $teamId
    ) {
      ...AddTeamMemberIntegrationAuthMutation_notification @relay(mask: false)
    }
  }
`

// What the service returned while disconnected (empty project lists, null APIs) stays in the store,
// so the service's records are marked stale and the next query that reads them fetches them again.
// TeamMemberIntegrations names each field after its service, except Jira's, which is atlassian.
export const addTeamMemberIntegrationAuthNotificationUpdater: SharedUpdater<
  AddTeamMemberIntegrationAuthMutation_notification$data
> = (payload) => {
  const service = payload.getValue('service')
  const teamMember = payload.getLinkedRecord('teamMember')
  const integrationField = service === 'jira' ? 'atlassian' : service
  teamMember.getLinkedRecord('integrations').getLinkedRecord(integrationField)?.invalidateRecord()
  teamMember
    .getLinkedRecords('services')
    .find((integrationService) => integrationService.getValue('service') === service)
    ?.invalidateRecord()
}

const AddTeamMemberIntegrationAuthMutation: StandardMutation<
  TAddTeamMemberIntegrationAuthMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TAddTeamMemberIntegrationAuthMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addTeamMemberIntegrationAuth')
      if (!payload) return
      addTeamMemberIntegrationAuthNotificationUpdater(payload, {atmosphere, store})
    },
    onCompleted,
    onError
  })
}

export default AddTeamMemberIntegrationAuthMutation
