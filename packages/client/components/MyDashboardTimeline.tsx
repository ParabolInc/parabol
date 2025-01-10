import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import {MyDashboardTimelineQuery} from '../__generated__/MyDashboardTimelineQuery.graphql'
import {DashTimeline} from '../types/constEnums'
import ErrorBoundary from './ErrorBoundary'
import TimelineFeedList from './TimelineFeedList'
import TimelineHeader from './TimelineHeader'
import TimelineLoadingEvents from './TimelineLoadingEvents'
import TimelineRightDrawer from './TimelineRightDrawer'
import TimelineSuggestedAction from './TimelineSuggestedAction'

interface Props {
  queryRef: PreloadedQuery<MyDashboardTimelineQuery>
}

const TimelineFeed = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  flex: 1,
  height: 'auto',
  paddingLeft: DashTimeline.MIN_PADDING,
  paddingRight: DashTimeline.MIN_PADDING,
  paddingTop: DashTimeline.MIN_PADDING
})

export const TimelineFeedItems = styled('div')({
  maxWidth: DashTimeline.FEED_MAX_WIDTH,
  minWidth: DashTimeline.FEED_MIN_WIDTH,
  width: '100%'
})

const FeedAndDrawer = styled('div')({
  display: 'flex',
  height: 'unset'
})

const MyDashboardTimeline = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<MyDashboardTimelineQuery>(
    graphql`
      query MyDashboardTimelineQuery(
        $first: Int!
        $after: DateTime
        $userIds: [ID!]
        $eventTypes: [TimelineEventEnum!]
        $teamIds: [ID!]
        $archived: Boolean
      ) {
        viewer {
          ...TimelineSuggestedAction_viewer
          ...TimelineRightDrawer_viewer
          ...TimelineHeader_viewer
        }
        ...TimelineFeedList_query
      }
    `,
    queryRef
  )
  const {viewer} = data
  useDocumentTitle('My History | Parabol', 'History')
  return (
    <FeedAndDrawer>
      <TimelineFeed>
        <TimelineFeedItems>
          <TimelineHeader viewerRef={viewer} />
          <ErrorBoundary>
            <Suspense fallback={<TimelineLoadingEvents />}>
              <TimelineSuggestedAction viewer={viewer} />
              <TimelineFeedList queryRef={data} />
            </Suspense>
          </ErrorBoundary>
        </TimelineFeedItems>
      </TimelineFeed>
      <TimelineRightDrawer viewer={viewer} />
    </FeedAndDrawer>
  )
}

export default MyDashboardTimeline
