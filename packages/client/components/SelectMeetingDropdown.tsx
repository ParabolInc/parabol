import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {SelectMeetingDropdown_meetings$key} from '~/__generated__/SelectMeetingDropdown_meetings.graphql'
import plural from '~/utils/plural'
import SelectMeetingDropdownItem from './SelectMeetingDropdownItem'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface Props {
  meetings: SelectMeetingDropdown_meetings$key
}

const SelectMeetingDropdown = (props: Props) => {
  const {meetings: meetingsRef} = props
  const meetings = useFragment(
    graphql`
      fragment SelectMeetingDropdown_meetings on NewMeeting @relay(plural: true) {
        ...SelectMeetingDropdownItem_meeting
        id
      }
    `,
    meetingsRef
  )
  const meetingCount = meetings.length
  const label = `${meetingCount} Active ${plural(meetingCount, 'Meeting')}`
  return (
    <>
      <DropdownMenu.Label className='text-xs text-slate-600 font-semibold px-4 py-2 select-none'>{label}</DropdownMenu.Label>
      {meetings.map((meeting) => (
        <SelectMeetingDropdownItem
          key={meeting.id}
          meeting={meeting}
        />
      ))}
    </>
  )
}

export default SelectMeetingDropdown
