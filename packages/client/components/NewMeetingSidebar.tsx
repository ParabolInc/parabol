import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Link} from 'react-router-dom'
import LogoBlock from './LogoBlock/LogoBlock'
import SidebarToggle from './SidebarToggle'
import Facilitator from './Facilitator'
import {PALETTE} from '../styles/paletteV2'
import {meetingTypeToLabel} from '../utils/meetings/lookups'
import isDemoRoute from '../utils/isDemoRoute'
import {NavSidebar} from '../types/constEnums'
import {NewMeetingSidebar_meeting} from '__generated__/NewMeetingSidebar_meeting.graphql'

const SidebarHeader = styled('div')({
  alignItems: 'flex-start',
  borderBottom: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  display: 'flex',
  marginBottom: 8,
  padding: 16,
  paddingRight: 8,
  position: 'relative'
})

const StyledToggle = styled(SidebarToggle)({
  paddingRight: 16
})

const SidebarParent = styled('div')({
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100vh',
  maxWidth: NavSidebar.WIDTH,
  minWidth: NavSidebar.WIDTH,
  userSelect: 'none'
})

const MeetingName = styled('div')({
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px'
})

const TeamDashboardLink = styled(Link)({
  color: PALETTE.LINK_BLUE,
  display: 'block',
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '16px',
  marginTop: 4,
  wordBreak: 'break-word',
  '&:hover': {
    color: PALETTE.LINK_BLUE,
    cursor: 'pointer'
  }
})

interface Props {
  children: ReactNode
  handleMenuClick: () => void
  toggleSidebar: () => void
  meeting: NewMeetingSidebar_meeting
}

const NewMeetingSidebar = (props: Props) => {
  const {children, handleMenuClick, toggleSidebar, meeting} = props
  const {meetingType, team} = meeting
  const {id: teamId, name: teamName} = team
  const meetingLabel = meetingTypeToLabel[meetingType]
  const teamLink = isDemoRoute() ? '/create-account' : `/team/${teamId}`
  return (
    <SidebarParent>
      <SidebarHeader>
        <StyledToggle onClick={toggleSidebar} />
        <div>
          <MeetingName>{`${meetingLabel} Meeting`}</MeetingName>
          <TeamDashboardLink to={teamLink}>
            {'Team: '}
            {teamName}
          </TeamDashboardLink>
        </div>
      </SidebarHeader>
      <Facilitator meeting={meeting} />
      {children}
      <LogoBlock variant='primary' onClick={handleMenuClick} />
    </SidebarParent>
  )
}

export default createFragmentContainer(NewMeetingSidebar, {
  meeting: graphql`
    fragment NewMeetingSidebar_meeting on NewMeeting {
      ...Facilitator_meeting
      id
      meetingType
      team {
        id
        name
      }
    }
  `
})
