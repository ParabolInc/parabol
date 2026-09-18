import plural from '../../../utils/plural'

interface Props {
  questionCount: number
  onPreview: () => void
}

const TeamHealthFirstMeetingSummary = (props: Props) => {
  const {questionCount, onPreview} = props
  if (questionCount === 0) return null
  return (
    <div className='text-fg-secondary text-sm'>
      First meeting: {questionCount} {plural(questionCount, 'question')} ·{' '}
      <button
        type='button'
        onClick={onPreview}
        className='cursor-pointer font-semibold text-accent hover:underline'
      >
        Preview
      </button>
    </div>
  )
}

export default TeamHealthFirstMeetingSummary
