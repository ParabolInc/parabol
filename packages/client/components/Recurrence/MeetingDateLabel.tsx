import {Info} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import {MeetingDateLabel_meeting$key} from '~/__generated__/MeetingDateLabel_meeting.graphql'
import {useMeetingSeriesDate} from '../../hooks/useMeetingSeriesDate'
import {toHumanReadable} from '../../utils/humanReadableRecurrenceRule'
import Tooltip from '../Tooltip'

interface Props {
  meetingRef: MeetingDateLabel_meeting$key
}

const MeetingDateLabel = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment MeetingDateLabel_meeting on NewMeeting {
        id
        meetingSeries {
          cancelledAt
          recurrenceRule
        }
        ...useMeetingSeriesDate_meeting
      }
    `,
    meetingRef
  )

  const {meetingSeries} = meeting
  const {label: dateLabel} = useMeetingSeriesDate(meeting)
  const isRecurrenceEnabled = meetingSeries && !meetingSeries.cancelledAt

  const humanReadableRecurrenceRule = useMemo(() => {
    return (
      meetingSeries?.recurrenceRule &&
      toHumanReadable(RRule.fromString(meetingSeries?.recurrenceRule))
    )
  }, [meetingSeries?.recurrenceRule])

  if (!isRecurrenceEnabled) {
    return null
  }

  return (
    <div className='hidden md:block'>
      <div className='flex flex-row items-center text-sm'>
        {dateLabel}
        <Tooltip
          className='flex flex-row items-center pl-2 text-slate-600'
          text={humanReadableRecurrenceRule}
        >
          <Info className='size-4.5' />
        </Tooltip>
      </div>
    </div>
  )
}

export default MeetingDateLabel
