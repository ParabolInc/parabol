import {getRequest} from 'relay-runtime'
import graphql from 'babel-plugin-relay/macro'

graphql`
  fragment UpdateDragLocationMutation_meeting on UpdateDragLocationPayload {
    drag: remoteDrag {
      id
      clientX
      clientY
      clientHeight
      clientWidth
      sourceId
      targetId
      targetOffsetX
      targetOffsetY
      isSpotlight
      updatedAt
    }
  }
`
const mutation = graphql`
  mutation UpdateDragLocationMutation($input: UpdateDragLocationInput!) {
    updateDragLocation(input: $input)
  }
`

const UpdateDragLocationMutation = (atmosphere, variables) => {
  const request = getRequest(mutation).params
  atmosphere.handleFetchPromise(request, variables)
}

export default UpdateDragLocationMutation
