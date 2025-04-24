import graphql from 'babel-plugin-relay/macro'
import {getRequest} from 'relay-runtime'
import Atmosphere, {noopSink} from '../Atmosphere'
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

const request = getRequest(mutation).params
const {id, name} = request
const UpdateDragLocationMutation = (
  atmosphere: Atmosphere,
  variables: TUpdateDragLocationMutation['variables']
) => {
  atmosphere.subscriptionClient?.subscribe(
    {operationName: name, docId: id, query: '', variables} as any,
    noopSink
  )
}

export default UpdateDragLocationMutation
