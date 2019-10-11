import React, {ReactElement, ReactNode} from 'react'
import styled from '@emotion/styled'
import DemoCreateAccountButton from './DemoCreateAccountButton'
import SidebarToggle from './SidebarToggle'
import {meetingTopBarMediaQuery} from '../styles/meeting'
import isDemoRoute from '../utils/isDemoRoute'
import hasToken from '../utils/hasToken'
import {meetingAvatarMediaQueries} from '../styles/meeting'

const localHeaderBreakpoint = '@media screen and (min-width: 600px)'

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
    paddingRight: 13 // compensate for overlapping block padding
  }
})

const HeadingBlock = styled('div')<{isMeetingSidebarCollapsed: boolean}>(
  ({isMeetingSidebarCollapsed}) => ({
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

const AvatarGroupBlock = styled('div')<{isDemoRoute: boolean}>(
  {
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 0',
    [meetingAvatarMediaQueries[0]]: {
      minHeight: 76,
      padding: 0
    }
  },
  ({isDemoRoute}) =>
    isDemoRoute && {
      // order: 3,
      // margin: '0 auto',
      // paddingTop: 12,
      // width: '100%',
      [localHeaderBreakpoint]: {
        // margin: 0,
        // order: 2,
        // paddingTop: 0,
        // width: 'auto'
      }
    }
)

const ChildrenBlock = styled('div')({
  width: '100%'
})

const Toggle = styled(SidebarToggle)({
  marginRight: 16
})

interface Props {
  avatarGroup: ReactElement
  children?: ReactNode
  isMeetingSidebarCollapsed: boolean
  toggleSidebar: () => void
}

const MeetingTopBar = (props: Props) => {
  const {avatarGroup, children, isMeetingSidebarCollapsed, toggleSidebar} = props
  const showButton = isDemoRoute() && !hasToken()
  return (
    <MeetingTopBarStyles>
      <HeadingBlock isMeetingSidebarCollapsed={isMeetingSidebarCollapsed}>
        {isMeetingSidebarCollapsed ? <Toggle onClick={toggleSidebar} /> : null}
        <ChildrenBlock>{children}</ChildrenBlock>
      </HeadingBlock>
      <AvatarGroupBlock isDemoRoute={showButton}>
        {showButton && (
          <PrimaryActionBlock>
            <DemoCreateAccountButton />
          </PrimaryActionBlock>
        )}
        {avatarGroup}
      </AvatarGroupBlock>
    </MeetingTopBarStyles>
  )
}
export default MeetingTopBar
