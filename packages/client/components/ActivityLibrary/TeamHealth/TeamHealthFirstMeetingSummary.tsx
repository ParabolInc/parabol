import plural from '../../../utils/plural'
import {FIRST_MEETING_PREVIEW_ID} from './TeamHealthFirstMeetingPreview'

interface Props {
  questionCount: number
  onPreview: () => void
}

const TeamHealthFirstMeetingSummary = (props: Props) => {
  const {questionCount, onPreview} = props
  if (questionCount === 0) return null
  const preview = () => {
    onPreview()
    document
      .getElementById(FIRST_MEETING_PREVIEW_ID)
      ?.scrollIntoView({behavior: 'smooth', block: 'start'})
  }
  return (
    <div className='text-fg-secondary text-sm'>
      First meeting: {questionCount} {plural(questionCount, 'question')} ·{' '}
      <button
        type='button'
        onClick={preview}
        className='cursor-pointer font-semibold text-accent hover:underline'
      >
        Preview
      </button>
    </div>
  )
}

export default TeamHealthFirstMeetingSummary
