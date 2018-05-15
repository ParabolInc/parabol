import getInProxy from 'universal/utils/relay/getInProxy'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'

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
    draggableType
  }
`
const mutation = graphql`
  mutation UpdateDragLocationMutation($input: UpdateDragLocationInput!) {
    updateDragLocation(input: $input)
  }
`

export const updateDragLocationTeamUpdater = (payload, store) => {
  const sourceId = getInProxy(payload, 'sourceId')
  if (!sourceId) return
  const draggable = store.get(sourceId)
  // const dragContext = draggable.getLinkedRecord('dragContext')
  // const coords = payload.getLinkedRecord('coords')
  // const foreignX = coords.getValue('x')
  // const foreignY = coords.getValue('y')
  // const clientWidth = payload.getValue('clientWidth')
  // const screenAdjustment = window.innerWidth / clientWidth
  // const localX = foreignX * screenAdjustment
  // const newCoords = createProxyRecord(store, 'Coords2D', {x: foreignX, y: foreignY})
  // dragContext.setLinkedRecord(newCoords, 'dragCoords')
}

const UpdateDragLocationMutation = (atmosphere, variables) => {
  const {_network: network} = atmosphere
  network.execute(mutation(), variables, {force: true})
}

export default UpdateDragLocationMutation
