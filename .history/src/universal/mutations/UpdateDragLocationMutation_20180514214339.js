import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'

type Variables = {
  isDragging: boolean,
  reflectionId: string
}

graphql`
  fragment UpdateDragLocationMutation_team on UpdateDragLocationPayload {
    
  }
`

const mutation = graphql`
  mutation UpdateDragLocationMutation($input: UpdateDragLocationInput!) {
    updateDragLocation(input: $input) {
      ...UpdateDragLocationMutation_team @relay(mask: false)
    }
  }
`

const UpdateDragLocationMutation = (
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

export default UpdateDragLocationMutation
