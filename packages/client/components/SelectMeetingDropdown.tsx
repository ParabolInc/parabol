import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {SelectMeetingDropdown_meetings$key} from '~/__generated__/SelectMeetingDropdown_meetings.graphql'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import plural from '~/utils/plural'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import SelectMeetingDropdownItem from './SelectMeetingDropdownItem'

interface Props {
  menuProps: MenuProps
  meetings: SelectMeetingDropdown_meetings$key
}

const HeaderLabel = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  padding: '2px 16px 8px',
  userSelect: 'none'
})

const SelectMeetingDropdown = (props: Props) => {
  const {meetings: meetingsRef, menuProps} = props
  const meetings = useFragment(
    graphql`
      fragment SelectMeetingDropdown_meetings on NewMeeting @relay(plural: true) {
        ...SelectMeetingDropdownItem_meeting
        id
      }
    `,
    meetingsRef
  )
  const {history} = useRouter()
  const meetingCount = meetings.length
  const label = `${meetingCount} Active ${plural(meetingCount, 'Meeting')}`
  return (
    <Menu ariaLabel={'Select the Meeting to enter'} {...menuProps}>
      <HeaderLabel>{label}</HeaderLabel>
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

export default SelectMeetingDropdown
