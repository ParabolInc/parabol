import styled from '@emotion/styled'
import ui from '../../../../styles/ui'
import {meetingBottomBarHeight, meetingSidebarMediaQuery} from '../../../../styles/meeting'
import {
  desktopBarShadow,
  bottomBarShadow,
  ZINDEX_BOTTOM_BAR,
  ZINDEX_DESKTOP_BAR
} from '../../../../styles/elevation'

const MeetingControlBar = styled('div')({
  alignItems: 'center',
  backgroundColor: ui.palette.white,
  boxShadow: bottomBarShadow,
  boxSizing: 'content-box',
  color: ui.hintColor,
  display: 'flex',
  flexWrap: 'nowrap',
  fontSize: 13,
  justifyContent: 'center',
  minHeight: meetingBottomBarHeight,
  overflowX: 'auto',
  width: '100%',
  zIndex: ZINDEX_BOTTOM_BAR,

  [meetingSidebarMediaQuery]: {
    boxShadow: desktopBarShadow,
    zIndex: ZINDEX_DESKTOP_BAR
  }
})

export default MeetingControlBar
