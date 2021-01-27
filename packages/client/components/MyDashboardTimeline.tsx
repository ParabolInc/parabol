import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import useStoreQueryRetry from '~/hooks/useStoreQueryRetry'
import {DashTimeline} from '../types/constEnums'
import {MyDashboardTimeline_viewer} from '../__generated__/MyDashboardTimeline_viewer.graphql'
import ErrorBoundary from './ErrorBoundary'
import TimelineFeedList from './TimelineFeedList'
import TimelineRightDrawer from './TimelineRightDrawer'
import TimelineSuggestedAction from './TimelineSuggestedAction'

interface Props {
  retry(): void
  viewer: MyDashboardTimeline_viewer
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
  const {retry, viewer} = props
  useStoreQueryRetry(retry)
  useDocumentTitle('My Timeline | Parabol', 'Timeline')
  return (
    <FeedAndDrawer>
      <TimelineFeed>
        <TimelineFeedItems>
          <ErrorBoundary>
            <TimelineSuggestedAction viewer={viewer} />
            <TimelineFeedList viewer={viewer} />
          </ErrorBoundary>
        </TimelineFeedItems>
      </TimelineFeed>
      <TimelineRightDrawer viewer={viewer} />
    </FeedAndDrawer>
  )
}

export default createFragmentContainer(MyDashboardTimeline, {
  viewer: graphql`
    fragment MyDashboardTimeline_viewer on User {
      id
      ...TimelineSuggestedAction_viewer
      ...TimelineFeedList_viewer
      ...TimelineRightDrawer_viewer
    }
  `
})
