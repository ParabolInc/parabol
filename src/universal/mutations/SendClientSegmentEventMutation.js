
const mutation = graphql`
  mutation SendClientSegmentEventMutation($event: String!, $options: SegmentEventTrackOptions) {
    segmentEventTrack(event: $event options: $options)
  }
`;

const SendClientSegmentEventMutation = async (atmosphere, event, options) => {
  const {_network: network} = atmosphere;
  const res = await network.request(mutation, {event, options});
  console.log('res', res)
};

export default SendClientSegmentEventMutation;