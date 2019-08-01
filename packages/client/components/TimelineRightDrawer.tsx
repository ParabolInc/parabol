import {TimelineRightDrawer_viewer} from '../__generated__/TimelineRightDrawer_viewer.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ErrorBoundary from './ErrorBoundary'
import TimelinePriorityTasks from './TimelinePriorityTasks'
import {PALETTE} from '../styles/paletteV2'
import {DASH_SIDEBAR} from './Dashboard/DashSidebar'
import TimelineNewFeature from './TimelineNewFeature'
import {DASH_TIMELINE} from '../types/constEnums'

interface Props {
  viewer: TimelineRightDrawer_viewer
}

const MIN_WIDTH =
  DASH_SIDEBAR.WIDTH +
  DASH_TIMELINE.FEED_MIN_WIDTH +
  DASH_TIMELINE.TIMELINE_DRAWER_WIDTH +
  DASH_TIMELINE.MIN_PADDING * 2

export const RightDrawer = styled('div')({
  display: 'none',
  minWidth: DASH_TIMELINE.TIMELINE_DRAWER_WIDTH,
  maxWidth: DASH_TIMELINE.TIMELINE_DRAWER_WIDTH,
  borderLeft: `1px solid ${PALETTE.BORDER_LIGHT}`,
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
        <>
          <TimelineNewFeature viewer={viewer} />
          <TimelinePriorityTasks viewer={viewer} />
        </>
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
