import {getRequest} from 'relay-runtime'
import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'

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

interface UpdateDragLocationInput {
  id: string
  clientHeight?: number
  clientWidth?: number
  meetingId: string
  sourceId: string
  targetId?: string
  teamId: string
  targetOffsetX?: number
  targetOffsetY?: number
  clientX?: number
  clientY?: number
  isSpotlight?: boolean
}

const UpdateDragLocationMutation = (
  atmosphere: Atmosphere,
  variables: {input: UpdateDragLocationInput}
) => {
  const request = getRequest(mutation).params
  atmosphere.handleFetchPromise(request, variables)
}

export default UpdateDragLocationMutation
