import {RemoveAzureDevopsAuthMutation as TRemoveAzureDevopsAuthMutation} from '../__generated__/RemoveAzureDevopsAuthMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {IRemoveAzureDevopsAuthOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'

graphql`
  fragment RemoveAzureDevopsAuthMutation_team on RemoveAzureDevopsAuthPayload {
    user {
      ...AzureDevopsProviderRowViewer @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation RemoveAzureDevopsAuthMutation($teamId: ID!) {
    removeAzureDevopsAuth(teamId: $teamId) {
      error {
        message
      }
      ...RemoveAzureDevopsAuthMutation_team @relay(mask: false)
    }
  }
`

const RemoveAzureDevopsAuthMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveAzureDevopsAuthOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<TRemoveAzureDevopsAuthMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted
  })
}

export default RemoveAzureDevopsAuthMutation
