import graphql from 'babel-plugin-relay/macro'
import {getRequest} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {SegmentEventTrackOptions} from '../__generated__/SendClientSideEventMutation.graphql'
import * as amplitude from '@amplitude/analytics-browser'

const mutation = graphql`
  mutation SendClientSideEventMutation($event: String!, $options: SegmentEventTrackOptions) {
    segmentEventTrack(event: $event, options: $options)
  }
`

export type SendClientSegmentEventOptions = SegmentEventTrackOptions

const SendClientSideEvent = (
  atmosphere: Atmosphere,
  event: string,
  options?: SendClientSegmentEventOptions
) => {
  atmosphere.handleFetchPromise(getRequest(mutation).params, {event, options})

  amplitude.track(event, options, {
    user_id: atmosphere.viewerId
  })
}

export default SendClientSideEvent
