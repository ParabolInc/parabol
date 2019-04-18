import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {IAddProviderOnMutationArguments} from '../types/graphql'
import {CompletedHandler, ErrorHandler} from '../types/relayMutations'

graphql`
  fragment AddProviderMutation_integration on AddProviderPayload {
    providerRow {
      service
      accessToken
      userCount
      integrationCount
    }
    provider {
      id
      accessToken
      providerUserName
      service
      userId
    }
    joinedIntegrationIds
    teamMember {
      id
      preferredName
      picture
    }
    user {
      ...TaskFooterIntegrateMenuViewerGitHubAuth
      # after adding, check for new integrations (populates the menu)
      ...TaskFooterIntegrateMenuViewerSuggestedIntegrations
    }
  }
`

const mutation = graphql`
  mutation AddProviderMutation($code: ID!, $service: IntegrationServiceEnum!, $teamId: ID!) {
    addProvider(code: $code, service: $service, teamId: $teamId) {
      error {
        message
      }
      ...AddProviderMutation_integration @relay(mask: false)
    }
  }
`

export const addProviderIntegrationUpdater = (payload, store, {atmosphere, teamId}) => {
  const {viewerId} = atmosphere
  const viewer = store.get(viewerId)
  const newIntegrationProvider = payload.getLinkedRecord('provider')
  const newProviderRow = payload.getLinkedRecord('providerRow')
  const service = newProviderRow.getValue('service')

  const oldProviderMap = viewer.getLinkedRecord('providerMap', {teamId})
  if (newIntegrationProvider) {
    viewer.setLinkedRecord(newIntegrationProvider, 'integrationProvider', {
      teamId,
      service
    })
  } else if (oldProviderMap) {
    // if there is no provider, then the mutation was not caused by the viewer, so ignore the accessToken change
    const oldProviderRow = oldProviderMap.getLinkedRecord(service)
    newProviderRow.setValue(oldProviderRow.getValue('accessToken'), 'accessToken')
  }
  if (oldProviderMap) {
    const oldProviderRow = oldProviderMap.getLinkedRecord(service)
    // copyFieldsFrom is just plain bad news
    oldProviderRow.setValue(newProviderRow.getValue('userCount'), 'userCount')
    oldProviderRow.setValue(newProviderRow.getValue('integrationCount'), 'integrationCount')
    oldProviderRow.setValue(newProviderRow.getValue('accessToken'), 'accessToken')
  }

  // join the existing integrations
  const joinedIntegrationIds = payload.getValue('joinedIntegrationIds')
  if (joinedIntegrationIds && joinedIntegrationIds.length > 0) {
    joinedIntegrationIds.forEach((globalId) => {
      const integration = store.get(globalId)
      if (!integration) return
      const teamMembers = integration.getLinkedRecords('teamMembers')
      teamMembers.push(payload.getLinkedRecord('teamMember'))
      integration.setLinkedRecords(teamMembers, 'teamMembers')
    })
  }
}

const AddProviderMutation = (
  atmosphere,
  variables: IAddProviderOnMutationArguments,
  _context,
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  const {teamId} = variables
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addProvider')
      if (!payload) return
      addProviderIntegrationUpdater(payload, store, {atmosphere, teamId})
    },
    onCompleted,
    onError
  })
}

export default AddProviderMutation
