import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {EditMeetingSeriesModal_series$key} from '../__generated__/EditMeetingSeriesModal_series.graphql'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {MeetingSeriesEditForm} from './MeetingSeriesEditForm'

interface Props {
  isOpen: boolean
  onClose: () => void
  seriesRef: EditMeetingSeriesModal_series$key | null | undefined
  // set when editing from inside a live meeting, which may have no series yet or a cancelled one
  meetingId?: string
  defaultTitle?: string
}

export const EditMeetingSeriesModal = (props: Props) => {
  const {isOpen, onClose, seriesRef, meetingId, defaultTitle} = props
  const series = useFragment(
    graphql`
      fragment EditMeetingSeriesModal_series on MeetingSeries {
        cancelledAt
        ...MeetingSeriesEditForm_series
      }
    `,
    seriesRef
  )
  const isSeriesActive = !!series && !series.cancelledAt
  // modal={false} disables radix focus trap so the embedded RecurrenceTimePicker portal can receive input.
  return (
    <Dialog isOpen={isOpen} onClose={onClose} modal={false}>
      <DialogContent
        className='md:max-w-md'
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className='mb-1'>
          {isSeriesActive ? 'Edit recurrence settings' : 'Start a recurring meeting'}
        </DialogTitle>
        <p className='mb-4 text-fg-secondary text-sm'>
          {isSeriesActive
            ? 'Change the schedule, rename the series, or cancel it.'
            : 'Name the series and choose how often it should repeat.'}
        </p>
        <MeetingSeriesEditForm
          seriesRef={series}
          meetingId={meetingId}
          defaultTitle={defaultTitle}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
