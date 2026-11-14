import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import type {MeetingDateLabel_meeting$key} from '~/__generated__/MeetingDateLabel_meeting.graphql'
import {Info} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import {useMeetingSeriesDate} from '../../hooks/useMeetingSeriesDate'
import {toHumanReadable} from '../../utils/humanReadableRecurrenceRule'

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
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='flex cursor-pointer flex-row items-center pl-2 text-fg-secondary'>
              <Info className='size-4.5' />
            </div>
          </TooltipTrigger>
          <TooltipContent side='bottom'>{humanReadableRecurrenceRule}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export default MeetingDateLabel
