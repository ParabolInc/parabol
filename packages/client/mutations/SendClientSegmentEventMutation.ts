import graphql from 'babel-plugin-relay/macro'
import {getRequest} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {SegmentEventTrackOptions} from '../__generated__/SendClientSegmentEventMutation.graphql'

const mutation = graphql`
  mutation SendClientSegmentEventMutation($event: String!, $options: SegmentEventTrackOptions) {
    segmentEventTrack(event: $event, options: $options)
  }
`

type Options = {
  eventId?: number
} & SegmentEventTrackOptions

const SendClientSegmentEventMutation = (
  atmosphere: Atmosphere,
  event: string,
  options?: Options
) => {
  atmosphere.handleFetchPromise(getRequest(mutation).params, {event, options})
}

export default SendClientSegmentEventMutation
