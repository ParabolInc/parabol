import styled from '@emotion/styled'
import {Comment} from '@mui/icons-material'
import React, {ReactElement, ReactNode} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {meetingAvatarMediaQueries} from '../styles/meeting'
import hasToken from '../utils/hasToken'
import isDemoRoute from '../utils/isDemoRoute'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import DemoCreateAccountButton from './DemoCreateAccountButton'
import PlainButton from './PlainButton/PlainButton'
import SidebarToggle from './SidebarToggle'

const localHeaderBreakpoint = makeMinWidthMediaQuery(600)

export const MeetingTopBarStyles = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  margin: 0,
  maxWidth: '100%',
  overflowX: 'auto',
  paddingLeft: 16,
  paddingRight: 14, // compensate for overlapping block padding
  width: '100%',
  [meetingAvatarMediaQueries[0]]: {
    paddingRight: 13 // compensate for overlapping block padding
  }
})

export const HeadingBlock = styled('div')<{isMeetingSidebarCollapsed?: boolean}>(
  ({isMeetingSidebarCollapsed = true}) => ({
    alignItems: 'flex-start',
    display: 'flex',
    paddingLeft: isMeetingSidebarCollapsed ? undefined : 8,
    marginTop: 16,
    minHeight: 24,
    [localHeaderBreakpoint]: {
      flex: 1
    }
  })
)

const PrimaryActionBlock = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

export const IconGroupBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  padding: '10px 0',
  [meetingAvatarMediaQueries[0]]: {
    minHeight: 76,
    padding: 0
  }
})

const ChildrenBlock = styled('div')({
  width: '100%'
})

const StyledSidebarToggle = styled(SidebarToggle)({
  marginRight: 16
})

const badgeSize = 10

const Badge = styled('div')({
  display: 'block',
  height: badgeSize,
  position: 'absolute',
  width: badgeSize,
  right: -1,
  top: -1,
  zIndex: 1,
  [meetingAvatarMediaQueries[0]]: {
    right: 2,
    top: 2
  },
  [meetingAvatarMediaQueries[1]]: {
    right: 3,
    top: 3
  }
})

const BadgeDot = styled('div')<{isCommentUnread: boolean}>(({isCommentUnread}) => ({
  backgroundColor: PALETTE.TOMATO_500,
  border: '1px solid rgba(255, 255, 255, .65)',
  borderRadius: badgeSize,
  display: isCommentUnread ? 'flex' : 'none',
  height: badgeSize,
  width: badgeSize
}))

const ButtonContainer = styled('div')({
  alignItems: 'center',
  alignContent: 'center',
  display: 'flex',
  height: 32,
  marginLeft: 11,
  position: 'relative',
  [meetingAvatarMediaQueries[0]]: {
    height: 48,
    marginLeft: 10
  },
  [meetingAvatarMediaQueries[1]]: {
    height: 56
  }
})

const DiscussionButton = styled(PlainButton)({
  alignItems: 'center',
  backgroundColor: PALETTE.GRAPE_700,
  borderRadius: '50%',
  display: 'flex',
  padding: 7,
  [meetingAvatarMediaQueries[0]]: {
    padding: 12
  },
  [meetingAvatarMediaQueries[1]]: {
    padding: 10
  }
})

const StyledIcon = styled(Comment)({
  color: '#FFFF',
  transform: 'scaleX(-1)',
  height: 18,
  width: 18,
  [meetingAvatarMediaQueries[0]]: {
    height: 24,
    width: 24
  },
  [meetingAvatarMediaQueries[1]]: {
    height: 36,
    width: 36
  }
})

interface Props {
  avatarGroup: ReactElement
  children?: ReactNode
  isCommentUnread?: boolean
  isMeetingSidebarCollapsed: boolean
  isRightDrawerOpen?: boolean
  toggleSidebar: () => void
  toggleDrawer?: () => void
}

const MeetingTopBar = (props: Props) => {
  const {
    avatarGroup,
    children,
    isCommentUnread = false,
    isMeetingSidebarCollapsed,
    isRightDrawerOpen,
    toggleDrawer,
    toggleSidebar
  } = props
  const showButton = isDemoRoute() && !hasToken()
  const showDiscussionButton = toggleDrawer && !isRightDrawerOpen
  return (
    <MeetingTopBarStyles>
      <HeadingBlock isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}>
        {isMeetingSidebarCollapsed && (
          <StyledSidebarToggle dataCy='topbar' onClick={toggleSidebar} />
        )}
        <ChildrenBlock>{children}</ChildrenBlock>
      </HeadingBlock>
      <IconGroupBlock>
        {showButton && (
          <PrimaryActionBlock>
            <DemoCreateAccountButton />
          </PrimaryActionBlock>
        )}
        {avatarGroup}
        {showDiscussionButton && toggleDrawer && (
          <ButtonContainer>
            <Badge>
              <BadgeDot isCommentUnread={isCommentUnread} />
            </Badge>
            <DiscussionButton onClick={toggleDrawer}>
              <StyledIcon />
            </DiscussionButton>
          </ButtonContainer>
        )}
      </IconGroupBlock>
    </MeetingTopBarStyles>
  )
}
export default MeetingTopBar
