import {commitMutation, graphql} from 'react-relay'
import {Environment} from 'relay-runtime'
import handleEditReflection from 'universal/mutations/handlers/handleEditReflection'
import {CompletedHandler, ErrorHandler} from '../types/relayMutations'
import IEditReflectionOnMutationArguments = GQL.IEditReflectionOnMutationArguments

graphql`
  fragment EditReflectionMutation_team on EditReflectionPayload {
    editorId
    isEditing
    phaseItemId
  }
`

const mutation = graphql`
  mutation EditReflectionMutation($phaseItemId: ID!, $isEditing: Boolean!) {
    editReflection(phaseItemId: $phaseItemId, isEditing: $isEditing) {
      ...EditReflectionMutation_team @relay(mask: false)
    }
  }
`

export const editReflectionTeamUpdater = (payload, store) => {
  handleEditReflection(payload, store)
}

const EditReflectionMutation = (
  atmosphere: Environment,
  variables: IEditReflectionOnMutationArguments,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('editReflection')
      if (!payload) return
      editReflectionTeamUpdater(payload, store)
    },
    optimisticUpdater: (store) => {
      const {phaseItemId, isEditing} = variables
      const phaseItem = store.get(phaseItemId)
      if (!phaseItem) return
      const editorIds = phaseItem.getValue('editorIds') || []
      const nextEditorIds = isEditing
        ? editorIds.concat('tmpUser')
        : editorIds.filter((id) => id !== 'tmpUser')
      phaseItem.setValue(nextEditorIds, 'editorIds')
    }
  })
}

export default EditReflectionMutation
