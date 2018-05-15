const mutation = graphql`
  mutation UpdateDragLocationMutation($event: String!, $options: SegmentEventTrackOptions) {
    segmentEventTrack(event: $event, options: $options)
  }
`

const UpdateDragLocationMutation = (atmosphere, event, options) => {
  const {_network: network} = atmosphere
  network.execute(mutation(), {event, options}, {force: true})
}

export default UpdateDragLocationMutation
