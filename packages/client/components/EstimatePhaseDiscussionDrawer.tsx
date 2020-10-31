import styled from '@emotion/styled'
import React, {useRef} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {desktopSidebarShadow} from '~/styles/elevation'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {EstimatePhaseDiscussionDrawer_meeting} from '~/__generated__/EstimatePhaseDiscussionDrawer_meeting.graphql'
import {Breakpoint, DiscussionThreadEnum, MeetingControlBarEnum, ZIndex} from '../types/constEnums'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import SwipeableDashSidebar from './SwipeableDashSidebar'

interface Props {
  isDesktop: boolean
  isDrawerOpen: boolean
  toggleDrawer: () => void
  meeting: EstimatePhaseDiscussionDrawer_meeting
}

const Drawer = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: desktopSidebarShadow,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  position: 'fixed',
  justifyContent: 'space-between',
  right: 0,
  padding: 0,
  width: DiscussionThreadEnum.WIDTH,
  zIndex: ZIndex.SIDE_SHEET, // make sure shadow is above cards
  [makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)]: {
    height: isExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT}px)`,
    width: DiscussionThreadEnum.WIDTH
  }
  // [desktopBreakpointMediaQuery]: {
  //   boxShadow: desktopSidebarShadow,
  //   position: 'relative',
  //   top: 0
  // },
  // [desktopDashWidestMediaQuery]: {
  //   position: 'fixed',
  //   top: AppBar.HEIGHT
  // }
}))

const MobileSidebar = styled('div')<{hideDrawer: boolean | null}>(({hideDrawer}) => ({
  bottom: 0,
  display: 'flex',
  flex: 1,
  height: '100vh',
  justifyContent: 'flex-end',
  overflow: 'hidden',
  position: 'fixed',
  right: 0,
  top: 0,
  userSelect: 'none',
  minWidth: DiscussionThreadEnum.WIDTH,
  maxWidth: DiscussionThreadEnum.WIDTH
}))

const VideoContainer = styled('div')<{hideVideo: boolean | null}>(({hideVideo}) => ({
  display: hideVideo ? 'none' : 'flex',
  // height: '30%',
  backgroundColor: '#FFFFFF',
  height: '160px',
  width: '100%'
}))

const Content = styled('div')({
  backgroundColor: '#FFFFFF',
  display: 'flex',
  overflow: 'hidden',
  height: '100%',
  flexDirection: 'column',
  // width: '35%'
  width: '100%'
})

const ThreadColumn = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  paddingTop: 4,
  justifyContent: 'flex-end',
  bottom: 0,
  position: 'relative',
  // paddingBottom: isDesktop ? 16 : 8,
  width: '100%',
  maxWidth: 700
}))

const EstimatePhaseDiscussionDrawer = (props: Props) => {
  const {isDesktop, isDrawerOpen, toggleDrawer, meeting} = props
  const {id: meetingId, endedAt, localStage} = meeting
  const {__id: storyId} = localStage
  const ref = useRef<HTMLDivElement>(null)
  const isExpanded = useCoverable('drawer', ref, MeetingControlBarEnum.HEIGHT) || !!endedAt

  if (true) {
    return (
      <Drawer isExpanded={isExpanded} ref={ref}>
        <VideoContainer hideVideo={false}>
          <h1>Desktop</h1>
        </VideoContainer>
        <ThreadColumn isDesktop={isDesktop}>
          <DiscussionThreadRoot meetingId={meetingId} threadSourceId={storyId} />
        </ThreadColumn>
      </Drawer>
    )
  }
  return (
    <SwipeableDashSidebar isOpen={isDrawerOpen} isRightSidebar onToggle={toggleDrawer}>
      <MobileSidebar hideDrawer={!isDrawerOpen}>
        <Content>
          <h1>Mobile</h1>
        </Content>
      </MobileSidebar>
    </SwipeableDashSidebar>
  )
}

graphql`
  fragment EstimatePhaseDiscussionDrawerStage on EstimateStage {
    ... on EstimateStageJira {
      __id
    }
  }
`
export default createFragmentContainer(EstimatePhaseDiscussionDrawer, {
  meeting: graphql`
    fragment EstimatePhaseDiscussionDrawer_meeting on PokerMeeting {
      id
      endedAt
      localStage {
        ...EstimatePhaseDiscussionDrawerStage @relay(mask: false)
      }
    }
  `
})
