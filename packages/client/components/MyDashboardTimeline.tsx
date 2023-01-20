import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import useNewFeatureSnackbar from '../hooks/useNewFeatureSnackbar'
import {DashTimeline} from '../types/constEnums'
import {MyDashboardTimelineQuery} from '../__generated__/MyDashboardTimelineQuery.graphql'
import ErrorBoundary from './ErrorBoundary'
import TimelineFeedList from './TimelineFeedList'
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
  height: '100%',
  overflow: 'auto'
})

const MyDashboardTimeline = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<MyDashboardTimelineQuery>(
    graphql`
      query MyDashboardTimelineQuery($first: Int!, $after: DateTime, $userIds: [ID!]) {
        viewer {
          ...TimelineSuggestedAction_viewer
          ...TimelineRightDrawer_viewer
          ...useNewFeatureSnackbar_viewer
        }
        ...TimelineFeedList_query
      }
    `,
    queryRef,
    {
      UNSTABLE_renderPolicy: 'full'
    }
  )
  const {viewer} = data
  useNewFeatureSnackbar(viewer)
  useDocumentTitle('My History | Parabol', 'History')
  return (
    <FeedAndDrawer>
      <TimelineFeed>
        <TimelineFeedItems>
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
