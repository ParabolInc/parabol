import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import {Check} from '../../../ui/icons'

export type TeamHealthQuestionView = 'firstMeeting' | 'questionBank'

const VIEWS: ReadonlyArray<{key: TeamHealthQuestionView; label: string}> = [
  {key: 'firstMeeting', label: 'First meeting'},
  {key: 'questionBank', label: 'Question bank'}
]

interface Props {
  view: TeamHealthQuestionView
  onChange: (view: TeamHealthQuestionView) => void
}

const TeamHealthQuestionViewToggle = (props: Props) => {
  const {view, onChange} = props
  return (
    <div role='group' aria-label='Questions to show' className='mb-4 flex flex-wrap gap-2'>
      {VIEWS.map(({key, label}) => {
        const isSelected = key === view
        return (
          <Button
            key={key}
            size='md'
            aria-pressed={isSelected}
            onClick={() => onChange(key)}
            className={cn(
              'gap-1 text-fg-primary',
              isSelected
                ? 'bg-surface-selected font-semibold text-fg-selected hover:bg-surface-selected focus:text-fg-selected'
                : 'border border-hairline-strong bg-transparent hover:bg-surface-hover'
            )}
          >
            {isSelected && <Check className='-ml-1 size-4' />}
            {label}
          </Button>
        )
      })}
    </div>
  )
}

export default TeamHealthQuestionViewToggle
