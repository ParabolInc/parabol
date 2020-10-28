import styled from '@emotion/styled'
import React, {useState} from 'react'
import useBreakpoint from '~/hooks/useBreakpoint'
import {desktopSidebarShadow} from '~/styles/elevation'
import {Breakpoint, DiscussionThreadEnum, ZIndex} from '../types/constEnums'
import SwipeableDashSidebar from './SwipeableDashSidebar'

interface Props {
  isOpen: boolean
}

const Drawer = styled('div')<{hideAgenda: boolean | null}>(({hideAgenda}) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: desktopSidebarShadow,
  display: hideAgenda ? 'none' : 'flex',
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
}))

const MobileSidebar = styled('div')<{hideAgenda: boolean | null}>(({hideAgenda}) => ({
  boxShadow: desktopSidebarShadow,
  display: hideAgenda ? 'none' : 'flex',
  flex: 1,
  height: '100vh',
  overflow: 'hidden',
  right: 0,
  bottom: 0,
  minWidth: '100vw',
  justifyContent: 'flex-end'
}))

const VideoContainer = styled('div')<{hideVideo: boolean | null}>(({hideVideo}) => ({
  display: hideVideo ? 'none' : 'flex',
  height: '35%',
  width: '100%',
  border: '2px solid red'
}))

const Content = styled('div')({
  backgroundColor: '#FFFFFF',
  display: 'flex',
  overflow: 'hidden',
  // padding-bottom makes space for the Start New Meeting FAB
  padding: '0 0 80px',
  height: '100%',
  flexDirection: 'column',
  border: '2px solid yellow',
  width: '35%'
})

const EstimatePhaseDiscussionDrawer = (props: Props) => {
  const [openSidebar, setOpenSidebar] = useState(true)
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)

  if (isDesktop) {
    return (
      <Drawer hideAgenda={false}>
        <VideoContainer hideVideo={false}>
          <h1>Desktop</h1>
        </VideoContainer>
      </Drawer>
    )
  }
  return (
    <SwipeableDashSidebar
      isOpen={openSidebar}
      onToggle={() => {
        setOpenSidebar(!openSidebar)
      }}
    >
      <MobileSidebar hideAgenda={false}>
        <Content>
          <h1>Mobile</h1>
        </Content>
      </MobileSidebar>
    </SwipeableDashSidebar>
  )
}

export default EstimatePhaseDiscussionDrawer
