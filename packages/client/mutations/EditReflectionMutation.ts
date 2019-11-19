import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import handleEditReflection from './handlers/handleEditReflection'
import {SimpleMutation} from '../types/relayMutations'
import {EditReflectionMutation as TEditReflectionMutation} from '../__generated__/EditReflectionMutation.graphql'

graphql`
  fragment EditReflectionMutation_team on EditReflectionPayload {
    editorId
    isEditing
    phaseItemId
  }
`

const mutation = graphql`
  mutation EditReflectionMutation($phaseItemId: ID!, $isEditing: Boolean!, $meetingId: ID!) {
    editReflection(phaseItemId: $phaseItemId, isEditing: $isEditing, meetingId: $meetingId) {
      ...EditReflectionMutation_team @relay(mask: false)
    }
  }
`

export const editReflectionTeamUpdater = (payload, store) => {
  handleEditReflection(payload, store)
}

const EditReflectionMutation: SimpleMutation<TEditReflectionMutation> = (atmosphere, variables) => {
  return commitMutation(atmosphere, {
    mutation,
    variables
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
