import styled from '@emotion/styled'
import React, {useState} from 'react'
import useBreakpoint from '~/hooks/useBreakpoint'
import useSidebar from '~/hooks/useSidebar'
import {desktopSidebarShadow} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV2'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {AppBar, Breakpoint, DiscussionThreadEnum, NavSidebar, ZIndex} from '../types/constEnums'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import SwipeableDashSidebar from './SwipeableDashSidebar'

interface Props {
  isDesktop: boolean
  isDrawerOpen: boolean
  toggleDrawer: () => void
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

const DashSidebarStyles = styled('div')({
  backgroundColor: '#fff',
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  maxWidth: NavSidebar.WIDTH,
  minWidth: NavSidebar.WIDTH,
  overflow: 'hidden',
  userSelect: 'none',
  position: 'fixed',
  right: 0,
  top: 0
})

const MobileSidebar = styled('div')<{hideDrawer: boolean | null}>(({hideDrawer}) => ({
  bottom: 0,
  display: hideDrawer ? 'none' : 'flex',
  // display: 'flex',
  flex: 1,
  height: '100vh',
  justifyContent: 'flex-end',
  // overflow: 'hidden',
  position: 'fixed',
  right: 0,
  top: 0,
  userSelect: 'none',
  // zIndex: 999,
  // zIndex: ZIndex.SIDE_SHEET, // make sure shadow is above cards
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

const EstimatePhaseDiscussionDrawer = (props: Props) => {
  const {isDesktop, isDrawerOpen, toggleDrawer} = props
  console.log('EstimatePhaseDiscussionDrawer -> isDrawerOpen', isDrawerOpen)

  if (isDesktop) {
    return (
      <Drawer>
        <VideoContainer hideVideo={false}>
          <h1>Desktop</h1>
        </VideoContainer>
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
