import {Button} from '../../../ui/Button/Button'
import {KeyboardArrowLeft, KeyboardArrowRight} from '../../../ui/icons'

interface Props {
  meetingNumber: number
  meetingCount: number
  onChange: (meetingNumber: number) => void
}

const TeamHealthMeetingPreviewPager = (props: Props) => {
  const {meetingNumber, meetingCount, onChange} = props
  return (
    <div className='flex items-center gap-1'>
      <Button
        variant='flat'
        shape='icon'
        className='size-7 text-fg-secondary'
        aria-label='Previous meeting'
        disabled={meetingNumber <= 1}
        onClick={() => onChange(meetingNumber - 1)}
      >
        <KeyboardArrowLeft className='size-5' />
      </Button>
      <h2
        aria-live='polite'
        className='min-w-24 text-center font-semibold text-fg-primary text-sm tabular-nums'
      >
        Meeting #{meetingNumber}
      </h2>
      <Button
        variant='flat'
        shape='icon'
        className='size-7 text-fg-secondary'
        aria-label='Next meeting'
        disabled={meetingNumber >= meetingCount}
        onClick={() => onChange(meetingNumber + 1)}
      >
        <KeyboardArrowRight className='size-5' />
      </Button>
    </div>
  )
}

export default TeamHealthMeetingPreviewPager
