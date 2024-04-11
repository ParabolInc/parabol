import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {AddAtlassianAuthMutation as TAddAtlassianAuthMutation} from '../__generated__/AddAtlassianAuthMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment AddAtlassianAuthMutation_team on AddAtlassianAuthPayload {
    teamMember {
      integrations {
        atlassian {
          ...AtlassianProviderRowAtlassianIntegration
          ...useIsIntegratedAtlassianIntegration
        }
      }
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
const AddAtlassianAuthMutation: StandardMutation<TAddAtlassianAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddAtlassianAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted: (res, errors) => {
      const error = res?.addAtlassianAuth?.error?.message
      if (error) {
        atmosphere.eventEmitter.emit('addSnackbar', {
          autoDismiss: 0,
          key: 'atlassianAuthError',
          message: error
        })
      }
      onCompleted(res, errors)
    },
    onError
  })
}

export default AddAtlassianAuthMutation
