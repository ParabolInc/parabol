import {getRequest} from 'relay-runtime'
import graphql from 'babel-plugin-relay/macro'
import {clearStaleDrop} from './StartDraggingReflectionMutation'

graphql`
  fragment UpdateDragLocationMutation_team on UpdateDragLocationPayload {
    remoteDrag {
      id
      coords {
        x
        y
      }
      clientHeight
      clientWidth
      sourceId
      targetId
      targetOffset {
        x
        y
      }
    }
    userId
  }
`
const mutation = graphql`
  mutation UpdateDragLocationMutation($input: UpdateDragLocationInput!) {
    updateDragLocation(input: $input)
  }
`

export const updateDragLocationTeamOnNext = (payload, {atmosphere}) => {
  const {remoteDrag} = payload
  const {id: remoteDragId} = remoteDrag
  clearStaleDrop(atmosphere, remoteDragId)
}

const UpdateDragLocationMutation = (atmosphere, variables) => {
  const {_network: network} = atmosphere
  network.execute(getRequest(mutation).params, variables, {force: true})
}

export default UpdateDragLocationMutation
