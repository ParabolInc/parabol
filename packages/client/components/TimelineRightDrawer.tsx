import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {PALETTE} from '../styles/paletteV3'
import {DashTimeline, NavSidebar} from '../types/constEnums'
import {TimelineRightDrawer_viewer$key} from '../__generated__/TimelineRightDrawer_viewer.graphql'
import ErrorBoundary from './ErrorBoundary'
import TimelinePriorityTasks from './TimelinePriorityTasks'

interface Props {
  viewer: TimelineRightDrawer_viewer$key
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
  borderLeft: `1px solid ${PALETTE.SLATE_400}`,
  height: 'fit-content',
  padding: 16,
  [makeMinWidthMediaQuery(MIN_WIDTH)]: {
    display: 'block'
  }
})

const TimelineRightDrawer = (props: Props) => {
  const {viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment TimelineRightDrawer_viewer on User {
        ...TimelinePriorityTasks_viewer
      }
    `,
    viewerRef
  )
  return (
    <RightDrawer>
      <ErrorBoundary>
        <TimelinePriorityTasks viewer={viewer} />
      </ErrorBoundary>
    </RightDrawer>
  )
}

export default TimelineRightDrawer
