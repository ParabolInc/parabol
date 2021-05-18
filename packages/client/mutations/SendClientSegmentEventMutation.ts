import graphql from 'babel-plugin-relay/macro'
import {getRequest} from 'relay-runtime'
import Atmosphere from '../Atmosphere'

const mutation = graphql`
  mutation SendClientSegmentEventMutation($event: String!, $options: SegmentEventTrackOptions) {
    segmentEventTrack(event: $event, options: $options)
  }
`

interface Options {
  eventId: number
  [key: string]: any
}

const SendClientSegmentEventMutation = (
  atmosphere: Atmosphere,
  event: string,
  options?: Options
) => {
  atmosphere.handleFetchPromise(getRequest(mutation).params, {event, options})
}

export default SendClientSegmentEventMutation
