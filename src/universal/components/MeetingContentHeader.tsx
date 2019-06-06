import React, {ReactElement, ReactNode} from 'react'
import styled from 'react-emotion'
import CreateAccountButton from 'universal/components/CreateAccountButton'
import SidebarToggle from 'universal/components/SidebarToggle'
import {meetingSidebarMediaQuery, meetingTopBarMediaQuery} from 'universal/styles/meeting'
import isDemoRoute from 'universal/utils/isDemoRoute'

const localHeaderBreakpoint = '@media screen and (min-width: 600px)'

const MeetingContentHeaderStyles = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  margin: 0,
  maxWidth: '100%',
  padding: '12px 16px 24px',
  width: '100%',
  [meetingTopBarMediaQuery]: {
    padding: '16px 16px 24px'
  }
})

const HeadingBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  minHeight: 32,
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

const Toggle = styled(SidebarToggle)(
  ({isMeetingSidebarCollapsed}: {isMeetingSidebarCollapsed: boolean}) => ({
    margin: 'auto 16px auto 0',

    [meetingSidebarMediaQuery]: {
      display: isMeetingSidebarCollapsed ? 'flex' : 'none',
      marginTop: 3
    }
  })
)

const ChildrenBlock = styled('div')({
  width: '100%'
})

interface Props {
  avatarGroup: ReactElement
  children?: ReactNode
  isMeetingSidebarCollapsed: boolean
  toggleSidebar: () => void
}

const MeetingContentHeader = (props: Props) => {
  const {avatarGroup, children, isMeetingSidebarCollapsed, toggleSidebar} = props
  return (
    <MeetingContentHeaderStyles>
      <HeadingBlock>
        <Toggle onClick={toggleSidebar} isMeetingSidebarCollapsed={isMeetingSidebarCollapsed} />
        <ChildrenBlock>{children}</ChildrenBlock>
      </HeadingBlock>
      <AvatarGroupBlock isDemoRoute={isDemoRoute()}>{avatarGroup}</AvatarGroupBlock>
      {isDemoRoute() ? (
        <PrimaryActionBlock>
          <CreateAccountButton />
        </PrimaryActionBlock>
      ) : null}
    </MeetingContentHeaderStyles>
  )
}
export default MeetingContentHeader
