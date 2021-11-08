import {getRequest} from 'relay-runtime'
import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'
import {UpdateDragLocationMutationVariables} from '../__generated__/UpdateDragLocationMutation.graphql'

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
    }
  }
`
const mutation = graphql`
  mutation UpdateDragLocationMutation($input: UpdateDragLocationInput!) {
    updateDragLocation(input: $input)
  }
`

const UpdateDragLocationMutation = (
  atmosphere: Atmosphere,
  variables: UpdateDragLocationMutationVariables
) => {
  const request = getRequest(mutation).params
  atmosphere.handleFetchPromise(request, variables)
}

export default UpdateDragLocationMutation
