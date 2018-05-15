import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'

type Variables = {
  isDragging: boolean,
  reflectionId: string
}

graphql`
  fragment DragReflectionMutation_team on DragReflectionPayload {
    reflection {
      dragCoords {
        x
      }
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
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {isDragging, reflectionId} = variables
      const reflection = store.get(reflectionId)
      if (isDragging) {
        const draggerUser = store.get(viewerId)
        reflection.setValue(viewerId, 'draggerUserId')
        reflection.setLinkedRecord(draggerUser, 'draggerUser')
      } else {
        reflection.setValue(null, 'draggerUserId')
        reflection.setValue(null, 'draggerUser')
      }
    }
  })
}

export default DragReflectionMutation
