import {Check} from '~/ui/icons'
import {cn} from '../../../../ui/cn'

interface Props {
  prompt: {id: string; question: string; groupColor: string}
  isAnswered: boolean
  preview: string
  onClick: () => void
}

const TeamPromptCollapsedAnswerRow = (props: Props) => {
  const {prompt, isAnswered, preview, onClick} = props
  return (
    <div
      role='button'
      tabIndex={0}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        onClick()
      }}
      className={cn(
        'flex min-h-12 cursor-pointer items-center gap-2 rounded-md bg-surface-card px-3 py-2 shadow-[var(--shadow-card)]',
        !isAnswered && 'text-fg-muted'
      )}
    >
      <span
        className={cn('h-2.5 w-2.5 shrink-0 rounded-full', !isAnswered && 'opacity-50')}
        style={{background: prompt.groupColor}}
      />
      <div className='min-w-0 flex-1'>
        <div className='truncate text-fg-secondary text-xs'>{prompt.question}</div>
        <div className='truncate text-sm'>{isAnswered ? preview : 'Up next'}</div>
      </div>
      {isAnswered && <Check className='h-4 w-4 shrink-0 text-jade-600' aria-label='Answered' />}
    </div>
  )
}

export default TeamPromptCollapsedAnswerRow
