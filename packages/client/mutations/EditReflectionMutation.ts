import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Environment} from 'relay-runtime'
import handleEditReflection from './handlers/handleEditReflection'
import {CompletedHandler, ErrorHandler} from '../types/relayMutations'
import {IEditReflectionOnMutationArguments} from '../types/graphql'

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
    onError
    // updater: (store) => {
    //   const payload = store.getRootField('editReflection')
    //   if (!payload) return
    //   editReflectionTeamUpdater(payload, store)
    // },
    // optimisticUpdater: (store) => {
    //   const {phaseItemId, isEditing} = variables
    //   const phaseItem = store.get(phaseItemId)
    //   if (!phaseItem) return
    //   const editorIds = phaseItem.getValue('editorIds') || []
    //   const nextEditorIds = isEditing
    //     ? Array.from(new Set(editorIds.concat('tmpUser')))
    //     : editorIds.filter((id) => id !== 'tmpUser')
    //   phaseItem.setValue(nextEditorIds, 'editorIds')
    // }
  })
}

export default EditReflectionMutation
