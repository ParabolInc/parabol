import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'
import {UpdateDragLocationMutation as TUpdateDragLocationMutation} from '../__generated__/UpdateDragLocationMutation.graphql'

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
  variables: TUpdateDragLocationMutation['variables']
) => {
  // TODO server ddon't respond
  atmosphere.fetchQuery(mutation, variables)
}

export default UpdateDragLocationMutation
