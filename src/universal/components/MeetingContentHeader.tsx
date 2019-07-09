import React, {ReactElement, ReactNode} from 'react'
import styled from 'react-emotion'
import DemoCreateAccountButton from 'universal/components/DemoCreateAccountButton'
import SidebarToggle from 'universal/components/SidebarToggle'
import {meetingTopBarMediaQuery} from 'universal/styles/meeting'
import isDemoRoute from 'universal/utils/isDemoRoute'
import hasToken from 'universal/utils/hasToken'

const localHeaderBreakpoint = '@media screen and (min-width: 600px)'

const MeetingContentHeaderStyles = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  margin: 0,
  maxWidth: '100%',
  padding: '12px 16px 32px',
  width: '100%',
  [meetingTopBarMediaQuery]: {
    padding: '16px 16px 32px'
  }
})

const HeadingBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  minHeight: 32,
  paddingLeft: 8,
  [localHeaderBreakpoint]: {
    flex: 1
  },
  [meetingTopBarMediaQuery]: {
    alignItems: 'flex-start'
  }
})

const PrimaryActionBlock = styled('div')({
  order: 2,
  [localHeaderBreakpoint]: {
    order: 3,
    paddingLeft: 16
  }
})

const AvatarGroupBlock = styled('div')(
  {
    display: 'flex',
    justifyContent: 'center',
    padding: 0
  },
  ({isDemoRoute}: {isDemoRoute: boolean}) =>
    isDemoRoute && {
      order: 3,
      margin: '0 auto',
      paddingTop: 12,
      width: '100%',
      [localHeaderBreakpoint]: {
        margin: 0,
        order: 2,
        paddingTop: 0,
        width: 'auto'
      }
    }
)

const ChildrenBlock = styled('div')({
  width: '100%'
})

const Toggle = styled(SidebarToggle)({
  paddingRight: 16
})

interface Props {
  avatarGroup: ReactElement
  children?: ReactNode
  isMeetingSidebarCollapsed: boolean
  toggleSidebar: () => void
}

const MeetingContentHeader = (props: Props) => {
  const {avatarGroup, children, isMeetingSidebarCollapsed, toggleSidebar} = props
  const showButton = isDemoRoute() && !hasToken()
  return (
    <MeetingContentHeaderStyles>
      <HeadingBlock>
        {isMeetingSidebarCollapsed ? <Toggle onClick={toggleSidebar} /> : null}
        <ChildrenBlock>{children}</ChildrenBlock>
      </HeadingBlock>
      <AvatarGroupBlock isDemoRoute={showButton}>{avatarGroup}</AvatarGroupBlock>
      {showButton && (
        <PrimaryActionBlock>
          <DemoCreateAccountButton />
        </PrimaryActionBlock>
      )}
    </MeetingContentHeaderStyles>
  )
}
export default MeetingContentHeader
