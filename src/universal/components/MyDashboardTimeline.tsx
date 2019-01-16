import {MyDashboardTimeline_viewer} from '__generated__/MyDashboardTimeline_viewer.graphql'
import React, {Suspense} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import TimelineSuggestedAction from 'universal/components/TimelineSuggestedAction'
import {PALETTE} from '../styles/paletteV2'
import {DASH_SIDEBAR} from './Dashboard/DashSidebar'
import TimelineLoadingEvents from './TimelineLoadingEvents'

interface Props {
  viewer: MyDashboardTimeline_viewer
}

const enum DIMS {
  FEED_MAX_WIDTH = 600,
  FEED_MIN_WIDTH = 400,
  TIMELINE_DRAWER_WIDTH = 336
}

const MIN_PADDING = 8

const TimelineFeed = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  flex: 1,
  paddingLeft: MIN_PADDING,
  paddingRight: MIN_PADDING,
  paddingTop: 24
})

const TimelineFeedItems = styled('div')({
  maxWidth: DIMS.FEED_MAX_WIDTH,
  minWidth: DIMS.FEED_MIN_WIDTH,
  width: '100%'
})

const MIN_WIDTH =
  DASH_SIDEBAR.WIDTH + DIMS.FEED_MIN_WIDTH + DIMS.TIMELINE_DRAWER_WIDTH + MIN_PADDING * 2

const RightDrawer = styled('div')({
  display: 'none',
  minWidth: DIMS.TIMELINE_DRAWER_WIDTH,
  maxWidth: DIMS.TIMELINE_DRAWER_WIDTH,
  borderLeft: `1px solid ${PALETTE.BORDER.LIGHT}`,
  padding: 24,
  [`@media screen and (min-width: ${MIN_WIDTH}px)`]: {
    display: 'flex'
  }
})

const FeedAndDrawer = styled('div')({
  display: 'flex',
  height: '100%'
})

const MyDashboardTimeline = (props: Props) => {
  const {viewer} = props
  return (
    <FeedAndDrawer>
      <TimelineFeed>
        <TimelineFeedItems>
          <Suspense fallback={<TimelineLoadingEvents />}>
            <TimelineSuggestedAction viewer={viewer} />
          </Suspense>
        </TimelineFeedItems>
      </TimelineFeed>
      <RightDrawer />
    </FeedAndDrawer>
  )
}

export default createFragmentContainer(
  MyDashboardTimeline,
  graphql`
    fragment MyDashboardTimeline_viewer on User {
      id
      ...TimelineSuggestedAction_viewer
    }
  `
)
