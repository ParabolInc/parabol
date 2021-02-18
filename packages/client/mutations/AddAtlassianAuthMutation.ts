import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {LocalHandlers} from '../types/relayMutations'
import {
  AddAtlassianAuthMutation as TAddAtlassianAuthMutation,
  AddAtlassianAuthMutationVariables
} from '../__generated__/AddAtlassianAuthMutation.graphql'

graphql`
  fragment AddAtlassianAuthMutation_team on AddAtlassianAuthPayload {
    teamMember {
      integrations {
        atlassian {
          ...AtlassianProviderRowAtlassianIntegration
          ...TaskFooterIntegrateMenuViewerAtlassianIntegration
        }
      }
      # after adding, check for new integrations (populates the menu)
      ...TaskFooterIntegrateMenuViewerSuggestedIntegrations
    }
  }
`

const mutation = graphql`
  mutation AddAtlassianAuthMutation($code: ID!, $teamId: ID!) {
    addAtlassianAuth(code: $code, teamId: $teamId) {
      error {
        message
      }
      ...AddAtlassianAuthMutation_team @relay(mask: false)
    }
  }
`

const AddAtlassianAuthMutation = (
  atmosphere,
  variables: AddAtlassianAuthMutationVariables,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<TAddAtlassianAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddAtlassianAuthMutation
