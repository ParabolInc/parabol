import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'
import type {UpdateDragLocationInput} from 'universal/types/schema.flow'

type Variables = {
  input: UpdateDragLocationInput,
}

graphql`
  fragment UpdateDragLocationMutation_team on UpdateDragLocationPayload {
    coords {
      x
      y
    }
    clientWidth
    distance
    sourceId
    targetId
    type
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
      const {input: {coords, sourceId}} = variables
      const draggable = store.get(sourceId)
      if (draggable) {
        draggable.setLinkedRecord(coords, 'dragCoords')
      }
    }
  })
}

export default UpdateDragLocationMutation
