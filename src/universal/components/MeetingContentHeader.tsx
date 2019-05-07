import React, {ReactElement, ReactNode} from 'react'
import styled from 'react-emotion'
import SidebarToggle from 'universal/components/SidebarToggle'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import {meetingSidebarMediaQuery} from 'universal/styles/meeting'

const MeetingContentHeaderStyles = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  margin: 0,
  maxWidth: '100%',
  padding: '0 1rem 1rem',
  width: '100%',
  [minWidthMediaQueries[3]]: {
    padding: '0 1rem 2rem'
  }
})

const HeadingBlock = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  padding: '1.25rem 0 1rem'
})

const Toggle = styled(SidebarToggle)(
  ({isMeetingSidebarCollapsed}: {isMeetingSidebarCollapsed: boolean}) => ({
    margin: '.0625rem .75rem .0625rem .5rem',

    [meetingSidebarMediaQuery]: {
      display: isMeetingSidebarCollapsed ? 'flex' : 'none'
    }
  })
)

const ChildrenBlock = styled('div')({})

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
      {avatarGroup}
    </MeetingContentHeaderStyles>
  )
}
export default MeetingContentHeader
