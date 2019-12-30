import {AddAzureDevopsAuthMutation as TAddAzureDevopsAuthMutation} from '../__generated__/AddAzureDevopsAuthMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import {IAddAzureDevopsAuthOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'

graphql`
  fragment AddAzureDevopsAuthMutation_team on AddAzureDevopsAuthPayload {
    user {
      ...AzureDevopsProviderRow_viewer
      ...TaskFooterIntegrateMenuViewerAzureDevopsAuth
      # after adding, check for new integrations (populates the menu)
      ...TaskFooterIntegrateMenuViewerSuggestedIntegrations
    }
  }
`

const mutation = graphql`
  mutation AddAzureDevopsAuthMutation($code: ID!, $teamId: ID!) {
    addAzureDevopsAuth(code: $code, teamId: $teamId) {
      error {
        message
      }
      ...AddAzureDevopsAuthMutation_team @relay(mask: false)
    }
  }
`

const AddAzureDevopsAuthMutation = (
  atmosphere,
  variables: IAddAzureDevopsAuthOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<TAddAzureDevopsAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddAzureDevopsAuthMutation
