import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {PALETTE} from '../styles/paletteV2'
import {DASH_SIDEBAR} from './Dashboard/DashSidebar'
import {DASH_TIMELINE} from './MyDashboardTimeline'
import TimelineNewFeature from './TimelineNewFeature'
import {TimelineRightDrawer_viewer} from '__generated__/TimelineRightDrawer_viewer.graphql'

interface Props {
  viewer: TimelineRightDrawer_viewer
}

const MIN_WIDTH =
  DASH_SIDEBAR.WIDTH +
  DASH_TIMELINE.FEED_MIN_WIDTH +
  DASH_TIMELINE.TIMELINE_DRAWER_WIDTH +
  DASH_TIMELINE.MIN_PADDING * 2

const RightDrawer = styled('div')({
  display: 'none',
  minWidth: DASH_TIMELINE.TIMELINE_DRAWER_WIDTH,
  maxWidth: DASH_TIMELINE.TIMELINE_DRAWER_WIDTH,
  borderLeft: `1px solid ${PALETTE.BORDER.LIGHT}`,
  padding: 24,
  [`@media screen and (min-width: ${MIN_WIDTH}px)`]: {
    display: 'flex'
  }
})

const TimelineRightDrawer = (props: Props) => {
  const {viewer} = props
  return (
    <RightDrawer>
      <TimelineNewFeature viewer={viewer} />
    </RightDrawer>
  )
}

export default createFragmentContainer(
  TimelineRightDrawer,
  graphql`
    fragment TimelineRightDrawer_viewer on User {
      ...TimelineNewFeature_viewer
    }
  `
)
