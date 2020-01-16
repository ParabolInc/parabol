import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useRouter from 'hooks/useRouter'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import getTeamIdFromPathname from 'utils/getTeamIdFromPathname'
import plural from 'utils/plural'
import {SelectMeetingDropdown_meetings} from '__generated__/SelectMeetingDropdown_meetings.graphql'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import SelectMeetingDropdownItem from './SelectMeetingDropdownItem'

interface Props {
  menuProps: MenuProps
  meetings: SelectMeetingDropdown_meetings
}

const HeaderLabel = styled('div')({
  borderBottom: `1px solid ${PALETTE.BORDER_LIGHT}`,
  color: PALETTE.TEXT_GRAY,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  padding: `8px 56px`,
  userSelect: 'none'
})

const NoMeetings = styled('div')({
  alignItems: 'center',
  display: 'flex',
  fontWeight: 600,
  justifyContent: 'center',
  padding: 8,
  width: '100%'
})

const SelectMeetingDropdown = (props: Props) => {
  const {meetings, menuProps} = props
  const {history} = useRouter()
  const meetingCount = meetings.length
  const label = `${meetingCount} Active ${plural(meetingCount, 'Meeting')}`
  const startMeeting = () => {
    const teamId = getTeamIdFromPathname()
    history.push(`/new-meeting/${teamId}`)
  }
  return (
    <Menu ariaLabel={'Select the Meeting to enter'} {...menuProps}>
      <HeaderLabel>{label}</HeaderLabel>
      {meetingCount === 0 && (
        <MenuItem onClick={startMeeting} label={<NoMeetings>{'Start a New Meeting'}</NoMeetings>} />
      )}
      {meetings.map((meeting) => {
        const handleClick = () => {
          history.push(`/meet/${meeting.id}`)
        }
        return (
          <MenuItem
            key={meeting.id}
            label={<SelectMeetingDropdownItem meeting={meeting} />}
            onClick={handleClick}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(SelectMeetingDropdown, {
  meetings: graphql`
    fragment SelectMeetingDropdown_meetings on NewMeeting @relay(plural: true) {
      ...SelectMeetingDropdownItem_meeting
      id
    }
  `
})
