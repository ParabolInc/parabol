import React, {Suspense} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import myDashboardTimelineQuery, {
  MyDashboardTimelineQuery
} from '../__generated__/MyDashboardTimelineQuery.graphql'
import MyDashboardTimeline from './MyDashboardTimeline'
import {useQueryParameterParser} from '../utils/useQueryParameterParser'

const MyDashboardTimelineRoot = () => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {eventTypes} = useQueryParameterParser(viewerId)
  const queryRef = useQueryLoaderNow<MyDashboardTimelineQuery>(myDashboardTimelineQuery, {
    first: 10,
    userIds: [viewerId],
    eventTypes
  })
  return (
    <Suspense fallback={''}>{queryRef && <MyDashboardTimeline queryRef={queryRef} />}</Suspense>
  )
}

export default MyDashboardTimelineRoot
