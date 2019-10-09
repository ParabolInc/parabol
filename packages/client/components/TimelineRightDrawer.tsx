import {TimelineRightDrawer_viewer} from '../__generated__/TimelineRightDrawer_viewer.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ErrorBoundary from './ErrorBoundary'
import TimelinePriorityTasks from './TimelinePriorityTasks'
import {PALETTE} from '../styles/paletteV2'
import TimelineNewFeature from './TimelineNewFeature'
import {DashTimeline, NavSidebar} from '../types/constEnums'

interface Props {
  viewer: TimelineRightDrawer_viewer
}

const MIN_WIDTH =
  NavSidebar.WIDTH +
  DashTimeline.FEED_MIN_WIDTH +
  DashTimeline.TIMELINE_DRAWER_WIDTH +
  DashTimeline.MIN_PADDING * 2

export const RightDrawer = styled('div')({
  display: 'none',
  minWidth: DashTimeline.TIMELINE_DRAWER_WIDTH,
  maxWidth: DashTimeline.TIMELINE_DRAWER_WIDTH,
  borderLeft: `1px solid ${PALETTE.BORDER_LIGHT}`,
  height: 'fit-content',
  padding: 24,
  [`@media screen and (min-width: ${MIN_WIDTH}px)`]: {
    display: 'block'
  }
})

const TimelineRightDrawer = (props: Props) => {
  const {viewer} = props
  return (
    <RightDrawer>
      <ErrorBoundary>
        <TimelineNewFeature viewer={viewer} />
        <TimelinePriorityTasks viewer={viewer} />
      </ErrorBoundary>
    </RightDrawer>
  )
}

export default createFragmentContainer(TimelineRightDrawer, {
  viewer: graphql`
    fragment TimelineRightDrawer_viewer on User {
      ...TimelineNewFeature_viewer
      ...TimelinePriorityTasks_viewer
    }
  `
})
