
const mutation = graphql`
  mutation SendClientSegmentEventMutation($event: String!, $options: SegmentEventTrackOptions) {
    segmentEventTrack(event: $event options: $options)
  }
`;

const SendClientSegmentEventMutation = (atmosphere, event, options) => {
  const {_network: network} = atmosphere;
  network.request(mutation(), {event, options});
};

export default SendClientSegmentEventMutation;
