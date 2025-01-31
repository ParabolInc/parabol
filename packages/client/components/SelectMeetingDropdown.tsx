import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {SelectMeetingDropdown_meetings$key} from '~/__generated__/SelectMeetingDropdown_meetings.graphql'
import plural from '~/utils/plural'
import SelectMeetingDropdownItem from './SelectMeetingDropdownItem'

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
    <div className='w-[var(--radix-dropdown-menu-trigger-width)]'>
      <DropdownMenu.Label className='px-4 py-2 text-xs font-semibold text-slate-600 select-none'>
        {label}
      </DropdownMenu.Label>
      {meetings.map((meeting) => (
        <SelectMeetingDropdownItem key={meeting.id} meeting={meeting} />
      ))}
    </div>
  )
}

export default SelectMeetingDropdown
