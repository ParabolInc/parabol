import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {RetroRecurrenceSettings_meeting$key} from '../../__generated__/RetroRecurrenceSettings_meeting.graphql'
import {MeetingSeriesEditForm} from '../MeetingSeriesEditForm'

interface Props {
  meetingRef: RetroRecurrenceSettings_meeting$key
  onDone: () => void
}

const RetroRecurrenceSettings = ({meetingRef, onDone}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment RetroRecurrenceSettings_meeting on RetrospectiveMeeting {
        id
        name
        meetingSeries {
          cancelledAt
          ...MeetingSeriesEditForm_series
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, name, meetingSeries} = meeting
  const isRecurring = !!meetingSeries && !meetingSeries.cancelledAt
  return (
    <div className='min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-6'>
      <p className='mt-0 mb-2 text-fg-secondary text-sm'>
        {isRecurring
          ? 'Change the schedule, rename the series, or cancel it.'
          : 'Name the series and choose how often it should repeat.'}
      </p>
      <MeetingSeriesEditForm
        seriesRef={meetingSeries}
        meetingId={meetingId}
        defaultTitle={name}
        recurrenceClassName='px-0'
        onClose={onDone}
      />
    </div>
  )
}

export default RetroRecurrenceSettings
