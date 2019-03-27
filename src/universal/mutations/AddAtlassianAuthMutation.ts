import {AddAtlassianAuthMutation} from '__generated__/AddAtlassianAuthMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {IAddAtlassianAuthOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'

graphql`
  fragment AddAtlassianAuthMutation_team on AddAtlassianAuthPayload {
    atlassianAuth {
      accessToken
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
  variables: IAddAtlassianAuthOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  const {teamId} = variables
  return commitMutation<AddAtlassianAuthMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addAtlassianAuth')
      if (!payload) return
      const team = store.get(teamId)
      if (!team) return
      const atlassianAuth = payload.getLinkedRecord('atlassianAuth')
      team.setLinkedRecord(atlassianAuth, 'atlassianAuth')
    },
    onCompleted,
    onError
  })
}

export default AddAtlassianAuthMutation
