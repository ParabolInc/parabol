import graphql from 'babel-plugin-relay/macro'
import {getRequest} from 'relay-runtime'

const mutation = graphql`
  mutation SendClientSegmentEventMutation(
    $event: SegmentClientEventEnum!
    $options: SegmentEventTrackOptions
  ) {
    segmentEventTrack(event: $event, options: $options)
  }
`

const SendClientSegmentEventMutation = (atmosphere, event, options?) => {
  const {_network: network} = atmosphere
  network.execute(getRequest(mutation).params, {event, options}, {force: true})
}

export default SendClientSegmentEventMutation
