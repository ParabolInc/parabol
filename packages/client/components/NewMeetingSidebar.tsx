import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useRenameMeeting} from '~/hooks/useRenameMeeting'
import {NewMeetingSidebar_meeting$key} from '~/__generated__/NewMeetingSidebar_meeting.graphql'
import {PALETTE} from '../styles/paletteV3'
import {NavSidebar} from '../types/constEnums'
import isDemoRoute from '../utils/isDemoRoute'
import EditableText from './EditableText'
import Facilitator from './Facilitator'
import LogoBlock from './LogoBlock/LogoBlock'
import NewMeetingSidebarUpgradeBlock from './NewMeetingSidebarUpgradeBlock'
import SidebarToggle from './SidebarToggle'
import InactiveTag from './Tag/InactiveTag'

const MeetingName = styled('div')({
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px',
  wordBreak: 'break-word'
})

const EditableMeetingName = MeetingName.withComponent(EditableText)

const SidebarHeader = styled('div')({
  alignItems: 'flex-start',
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
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

const TeamDashboardLink = styled(Link)({
  color: PALETTE.SKY_500,
  display: 'block',
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '16px',
  marginTop: 4,
  wordBreak: 'break-word',
  '&:hover': {
    color: PALETTE.SKY_500,
    cursor: 'pointer'
  }
})

const MeetingCompletedTag = styled(InactiveTag)({
  display: 'inline-flex',
  margin: '4px 0 0 0'
})

interface Props {
  children: ReactNode
  handleMenuClick: () => void
  toggleSidebar: () => void
  meeting: NewMeetingSidebar_meeting$key
}

const NewMeetingSidebar = (props: Props) => {
  const {children, handleMenuClick, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment NewMeetingSidebar_meeting on NewMeeting {
        ...Facilitator_meeting
        id
        endedAt
        facilitatorUserId
        name
        team {
          id
          name
          organization {
            id
            tierLimitExceededAt
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, endedAt, team, name: meetingName, facilitatorUserId} = meeting
  const {id: teamId, name: teamName, organization} = team
  const {id: orgId, tierLimitExceededAt} = organization
  const teamLink = isDemoRoute() ? '/create-account' : `/team/${teamId}`
  const {handleSubmit, validate, error} = useRenameMeeting(meetingId)
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isFacilitator = viewerId === facilitatorUserId

  return (
    <SidebarParent data-cy='sidebar'>
      <SidebarHeader>
        <StyledToggle dataCy={`sidebar`} onClick={toggleSidebar} />
        <div>
          {isFacilitator ? (
            <EditableMeetingName
              error={error?.message}
              handleSubmit={handleSubmit}
              initialValue={meetingName}
              isWrap
              maxLength={50}
              validate={validate}
              placeholder={'Best Meeting Ever!'}
            />
          ) : (
            <MeetingName>{meetingName}</MeetingName>
          )}
          <TeamDashboardLink to={teamLink}>
            {'Team: '}
            {teamName}
          </TeamDashboardLink>
          {endedAt && <MeetingCompletedTag>Meeting Completed</MeetingCompletedTag>}
        </div>
      </SidebarHeader>
      <Facilitator meetingRef={meeting} />
      {children}
      {tierLimitExceededAt && (
        <NewMeetingSidebarUpgradeBlock
          onClick={handleMenuClick}
          orgId={orgId}
          meetingId={meetingId}
        />
      )}
      <LogoBlock onClick={handleMenuClick} />
    </SidebarParent>
  )
}

export default NewMeetingSidebar
