import {getRequest} from 'relay-runtime'
import graphql from 'babel-plugin-relay/macro'

graphql`
  fragment UpdateDragLocationMutation_meeting on UpdateDragLocationPayload {
    remoteDrag {
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
    userId
  }
`
const mutation = graphql`
  mutation UpdateDragLocationMutation($input: UpdateDragLocationInput!) {
    updateDragLocation(input: $input)
  }
`

const UpdateDragLocationMutation = (atmosphere, variables) => {
  const {_network: network} = atmosphere
  network.execute(getRequest(mutation).params, variables, {force: true})
}

export default UpdateDragLocationMutation
