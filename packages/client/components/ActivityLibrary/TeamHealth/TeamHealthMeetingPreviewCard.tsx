import {useState} from 'react'
import {Button} from '../../../ui/Button/Button'
import TeamHealthResponseCardHeader from '../../TeamHealth/TeamHealthResponseCardHeader'
import TeamHealthScoreScale from '../../TeamHealth/TeamHealthScoreScale'

interface Props {
  question: {
    question: string
    description: string | null | undefined
    category: {id: string; name: string}
  }
  orderedCategoryIds: ReadonlyArray<string>
  stageIndex: number
  stageCount: number
  onPrev: () => void
  onNext: () => void
}

// a scaled-down TeamHealthResponseCard whose score is local and never saved
const TeamHealthMeetingPreviewCard = (props: Props) => {
  const {question, orderedCategoryIds, stageIndex, stageCount, onPrev, onNext} = props
  const [score, setScore] = useState<number | null>(null)
  const isLast = stageIndex === stageCount - 1
  return (
    <div className='rounded-2xl bg-surface-card p-4 shadow-card'>
      <TeamHealthResponseCardHeader
        categoryId={question.category.id}
        categoryName={question.category.name}
        orderedCategoryIds={orderedCategoryIds}
        stageIndex={stageIndex}
        stageCount={stageCount}
      />
      <h3 className='mt-4 text-center font-bold text-fg-primary text-lg'>{question.question}</h3>
      {question.description && (
        <p className='mt-1 text-center text-fg-muted text-sm'>{question.description}</p>
      )}
      <div className='mt-4'>
        <TeamHealthScoreScale
          compact
          score={score}
          onSelectScore={(value) => setScore(score === value ? null : value)}
        />
      </div>
      <div className='mt-4 flex items-center justify-between'>
        {stageIndex === 0 ? (
          <div />
        ) : (
          <Button variant='ghost' size='md' onClick={onPrev}>
            Back
          </Button>
        )}
        <Button variant='outline' size='md' onClick={onNext}>
          {isLast ? 'Start over' : 'Next'}
        </Button>
      </div>
    </div>
  )
}

export default TeamHealthMeetingPreviewCard
