/**
 * Updates the editing state of a retrospective reflection.
 *
 */
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'
import handleEditReflection from 'universal/mutations/handlers/handleEditReflection'

type Variables = {
  isEditing: boolean,
  reflectionId: string
}

graphql`
  fragment EditReflectionMutation_team on EditReflectionPayload {
    meeting {
      id
    }
    reflection {
      id
      editorIds
      isEditing
    }
    editorId
    isEditing
  }
`

const mutation = graphql`
  mutation EditReflectionMutation($reflectionId: ID!, $isEditing: Boolean!) {
    editReflection(reflectionId: $reflectionId, isEditing: $isEditing) {
      ...EditReflectionMutation_team @relay(mask: false)
    }
  }
`

export const editReflectionTeamUpdater = (payload, store) => {
  handleEditReflection(payload, store)
}

const EditReflectionMutation = (
  atmosphere: Object,
  variables: Variables,
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
      const {reflectionId, isEditing} = variables
      const reflection = store.get(reflectionId)
      const reflectionEditorIds = reflection.getValue('editorIds') || []
      const nextEditorIds = isEditing
        ? reflectionEditorIds.concat('tmpUser')
        : reflectionEditorIds.slice(1)
      reflection.setValue(nextEditorIds, 'editorIds')
      reflection.setValue(nextEditorIds.length > 0, 'isEditing')
    }
  })
}

export default EditReflectionMutation
