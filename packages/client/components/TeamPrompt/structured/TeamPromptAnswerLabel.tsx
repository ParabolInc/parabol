import {Check} from '~/ui/icons'

interface Props {
  question: string
  groupColor: string
  isAnswered: boolean
}

const TeamPromptAnswerLabel = (props: Props) => {
  const {question, groupColor, isAnswered} = props
  return (
    <div className='flex items-center gap-2 font-semibold text-[13px] text-fg-secondary'>
      <span className='h-2.5 w-2.5 shrink-0 rounded-full' style={{background: groupColor}} />
      <span className='flex-1'>{question}</span>
      {isAnswered && <Check className='h-4 w-4 text-jade-600' aria-label='Answered' />}
    </div>
  )
}

export default TeamPromptAnswerLabel
