import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'
import getInProxy from 'universal/utils/relay/getInProxy'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'

type Variables = {
  isDragging: boolean,
  reflectionId: string
}

graphql`
  fragment DragReflectionMutation_team on DragReflectionPayload {
    reflection {
      id
      draggerUserId
      draggerUser {
        id
        preferredName
      }
    }
  }
`

const mutation = graphql`
  mutation DragReflectionMutation($isDragging: Boolean!, $reflectionId: ID!) {
    dragReflection(isDragging: $isDragging, reflectionId: $reflectionId) {
      ...DragReflectionMutation_team @relay(mask: false)
    }
  }
`

export const dragReflectionTeamUpdater = (payload, store) => {
  const isDragging = Boolean(getInProxy(payload, 'reflection', 'draggerUserId'))
  if (!isDragging) {
    const reflectionId = getInProxy(payload, 'reflection', 'id')
    if (!reflectionId) return
    const reflection = store.get(reflectionId)
    reflection.setValue(null, 'dragCoords')
  }
}

const DragReflectionMutation = (
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
      const payload = store.getRootField('dragReflection')
      if (!payload) return
      dragReflectionTeamUpdater(payload, store)
    },
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {isDragging, reflectionId} = variables
      const reflection = store.get(reflectionId)
      if (isDragging) {
        const draggerUser = store.get(viewerId)
        const dragContextProxy = createProxyRecord(store, 'DragContext', {
          draggerUserId: viewerId,
          dragggerUser: store.get(viewerId)
        })
        reflection.setLinkedRecord(dragContextProxy, 'dragContext')
      } else {
        reflection.setValue(null, 'draggerUserId')
        reflection.setValue(null, 'draggerUser')
        reflection.setValue(null, 'dragCoords')
      }
    }
  })
}

export default DragReflectionMutation
