import React, {ReactElement, ReactNode} from 'react'
import styled from '@emotion/styled'
import DemoCreateAccountButton from './DemoCreateAccountButton'
import SidebarToggle from './SidebarToggle'
import isDemoRoute from '../utils/isDemoRoute'
import hasToken from '../utils/hasToken'
import {meetingAvatarMediaQueries} from '../styles/meeting'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import PlainButton from './PlainButton/PlainButton'
import {PALETTE} from '~/styles/paletteV2'
import Icon from './Icon'
import {ICON_SIZE} from '~/styles/typographyV2'

const localHeaderBreakpoint = makeMinWidthMediaQuery(600)

const MeetingTopBarStyles = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  margin: 0,
  maxWidth: '100%',
  paddingLeft: 16,
  paddingRight: 14, // compensate for overlapping block padding
  width: '100%',
  [meetingAvatarMediaQueries[0]]: {
    paddingRight: 13, // compensate for overlapping block padding
  },
})

const HeadingBlock = styled('div')<{isMeetingSidebarCollapsed: boolean}>(
  ({isMeetingSidebarCollapsed}) => ({
    alignItems: 'flex-start',
    display: 'flex',
    paddingLeft: isMeetingSidebarCollapsed ? undefined : 8,
    marginTop: 16,
    minHeight: 24,
    [localHeaderBreakpoint]: {
      flex: 1,
    },
  })
)

const PrimaryActionBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
})

const AvatarGroupBlock = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  padding: '10px 0',
  [meetingAvatarMediaQueries[0]]: {
    minHeight: 76,
    padding: 0,
  },
})

const ChildrenBlock = styled('div')({
  width: '100%',
})

const StyledSidebarToggle = styled(SidebarToggle)({
  marginRight: 16,
})

const StyledIcon = styled(Icon)({
  color: '#FFFF',
  transform: 'scaleX(-1)',
  fontSize: ICON_SIZE.MD24,
  [meetingAvatarMediaQueries[0]]: {
    fontSize: ICON_SIZE.MD36,
  },
})

const ButtonContainer = styled('div')({
  alignItems: 'center',
  alignContent: 'center',
  display: 'flex',
  paddingLeft: 4,
})

const DiscussionButton = styled(PlainButton)({
  alignItems: 'center',
  backgroundColor: PALETTE.TEXT_PURPLE,
  borderRadius: '50%',
  display: 'flex',
  padding: 8,
  [meetingAvatarMediaQueries[0]]: {
    padding: 10,
  },
})

interface Props {
  avatarGroup: ReactElement
  children?: ReactNode
  isMeetingSidebarCollapsed: boolean
  isDrawerOpen?: boolean
  toggleSidebar: () => void
  toggleDrawer?: () => void
}

const MeetingTopBar = (props: Props) => {
  const {
    avatarGroup,
    children,
    isMeetingSidebarCollapsed,
    isDrawerOpen,
    toggleDrawer,
    toggleSidebar,
  } = props
  const showButton = isDemoRoute() && !hasToken()
  const showDiscussionButton = toggleDrawer && !isDrawerOpen
  return (
    <MeetingTopBarStyles>
      <HeadingBlock isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}>
        {isMeetingSidebarCollapsed && (
          <StyledSidebarToggle dataCy='topbar' onClick={toggleSidebar} />
        )}
        <ChildrenBlock>{children}</ChildrenBlock>
      </HeadingBlock>
      <AvatarGroupBlock>
        {showButton && (
          <PrimaryActionBlock>
            <DemoCreateAccountButton />
          </PrimaryActionBlock>
        )}
        {avatarGroup}
        {showDiscussionButton && (
          <ButtonContainer>
            <DiscussionButton onClick={toggleDrawer}>
              <StyledIcon>comment</StyledIcon>
            </DiscussionButton>
          </ButtonContainer>
        )}
      </AvatarGroupBlock>
    </MeetingTopBarStyles>
  )
}
export default MeetingTopBar
