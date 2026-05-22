import type {MeetingSeriesEditForm_series$key} from '../__generated__/MeetingSeriesEditForm_series.graphql'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import {MeetingSeriesEditForm} from './MeetingSeriesEditForm'

interface Props {
  isOpen: boolean
  onClose: () => void
  seriesRef: MeetingSeriesEditForm_series$key
}

export const EditMeetingSeriesModal = (props: Props) => {
  const {isOpen, onClose, seriesRef} = props
  // modal={false} disables radix focus trap so the embedded RecurrenceTimePicker portal can receive input.
  return (
    <Dialog isOpen={isOpen} onClose={onClose} modal={false}>
      <DialogContent className='md:max-w-md'>
        <DialogTitle className='mb-1'>Edit scheduled meeting</DialogTitle>
        <p className='mb-4 text-slate-600 text-sm'>
          Change the schedule, rename the series, or cancel it.
        </p>
        <MeetingSeriesEditForm seriesRef={seriesRef} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
