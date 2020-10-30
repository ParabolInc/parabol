import styled from '@emotion/styled'
import React, {useRef, useState} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import useSidebar from '~/hooks/useSidebar'
import {desktopSidebarShadow} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV2'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {AppBar, Breakpoint, DiscussionThreadEnum, NavSidebar, ZIndex} from '../types/constEnums'
import DiscussionThreadRoot from './DiscussionThreadRoot'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import SwipeableDashSidebar from './SwipeableDashSidebar'

interface Props {
  isDesktop: boolean
  isDrawerOpen: boolean
  toggleDrawer: () => void
  meetingId: string
  storyId: string
}

const Drawer = styled('div')({
  backgroundColor: '#FFFFFF',
  boxShadow: desktopSidebarShadow,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
  position: 'fixed',
  right: 0,
  bottom: 0,
  width: DiscussionThreadEnum.WIDTH,
  zIndex: ZIndex.SIDE_SHEET // make sure shadow is above cards
  // [desktopBreakpointMediaQuery]: {
  //   boxShadow: desktopSidebarShadow,
  //   position: 'relative',
  //   top: 0
  // },
  // [desktopDashWidestMediaQuery]: {
  //   position: 'fixed',
  //   top: AppBar.HEIGHT
  // }
})

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
  height: '35%',
  width: '100%',
  border: '2px solid red'
}))

const Content = styled('div')({
  boxShadow: desktopSidebarShadow,
  backgroundColor: '#FFFFFF',
  display: 'flex',
  overflow: 'hidden',
  height: '100%',
  flexDirection: 'column',
  // width: '35%'
  width: '100%'
})

const MeetingNavList = styled('ul')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  listStyle: 'none',
  margin: 0,
  minHeight: 0, // very important! allows children to collapse for overflow
  padding: 0
})
const ThreadColumn = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  paddingTop: 4,
  paddingBottom: isDesktop ? 16 : 8,
  width: '100%',
  maxWidth: 700
}))

const EstimatePhaseDiscussionDrawer = (props: Props) => {
  const {isDesktop, isDrawerOpen, toggleDrawer, meetingId, storyId} = props
  console.log('EstimatePhaseDiscussionDrawer -> props', props)
  console.log('EstimatePhaseDiscussionDrawer -> isDrawerOpen', isDrawerOpen)
  const meetingContentRef = useRef<HTMLDivElement>(null)

  if (isDesktop) {
    return (
      <Drawer>
        <VideoContainer hideVideo={false}>
          <h1>Desktop</h1>
        </VideoContainer>
        <ThreadColumn isDesktop={isDesktop}>
          <DiscussionThreadRoot
            meetingContentRef={meetingContentRef}
            meetingId={meetingId}
            threadSourceId={storyId}
          />
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

export default EstimatePhaseDiscussionDrawer
// export default createFragmentContainer(EstimatePhaseDiscussionDrawer, {
//   meeting: graphql`
//     fragment EstimatePhaseDiscussionDrawer_meeting on PokerMeeting {
//       id
//     }
//   `
// })
