import graphql from 'babel-plugin-relay/macro'
import {getRequest} from 'relay-runtime'

const mutation = graphql`
  mutation SendClientSegmentEventMutation($event: String!, $options: SegmentEventTrackOptions) {
    segmentEventTrack(event: $event, options: $options)
  }
`

const SendClientSegmentEventMutation = (atmosphere, event, options?) => {
  atmosphere.handleFetchPromise(getRequest(mutation).params, {event, options})
}

export default SendClientSegmentEventMutation
