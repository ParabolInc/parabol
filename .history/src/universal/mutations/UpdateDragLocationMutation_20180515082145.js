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

const updateDragLocationTeamUpdater = (payload, store) => {
  const draggable = store.get(sourceId)
  const coords = payload.getLinkedRecord('coords')
  draggable.setLinkedRecord(coords, 'dragCoords')
}

const UpdateDragLocationMutation = (atmosphere, variables) => {
  const {_network: network} = atmosphere
  network.execute(mutation(), variables, {force: true})
}

export default UpdateDragLocationMutation
