import {cn} from '../../ui/cn'

interface Props {
  score: number | null
  // omit to render the scale as a read-only summary, e.g. once the meeting has ended
  onSelectScore?: (score: number) => void
}

const SCORES = [1, 2, 3, 4, 5]
// low (disagree) -> high (agree), using paletteV3 tailwind classes. All five are saturated mid-tones
// that hold their white label on either theme — slate-600 rather than slate-400 for the neutral,
// which on a dark card would have been a near-white chip with white text on it.
const SCORE_COLORS = [
  'bg-tomato-500',
  'bg-gold-500',
  'bg-slate-600',
  'bg-jade-400',
  'bg-jade-500'
] as const

const TeamHealthScoreScale = (props: Props) => {
  const {score, onSelectScore} = props
  return (
    <div>
      <div className='flex items-center justify-center gap-4'>
        {SCORES.map((value, idx) => {
          const isSelected = score === value
          const className = cn(
            'flex h-14 w-14 select-none items-center justify-center rounded-full font-semibold text-lg text-white transition-transform',
            SCORE_COLORS[idx],
            isSelected
              ? 'scale-110 ring-2 ring-grape-700 ring-offset-2 ring-offset-surface-card dark:ring-grape-200'
              : // a read-only scale fades the answers not given much harder, so the one that was
                // given reads as the answer rather than as one of five equal options
                onSelectScore
                ? 'opacity-70 hover:opacity-100'
                : 'opacity-40'
          )
          return onSelectScore ? (
            <button
              key={value}
              type='button'
              onClick={() => onSelectScore(value)}
              className={className}
            >
              {value}
            </button>
          ) : (
            <div key={value} className={className}>
              {value}
            </div>
          )
        })}
      </div>
      <div className='mt-2 flex justify-between text-fg-muted text-xs'>
        <span>Strongly disagree</span>
        <span>Strongly agree</span>
      </div>
    </div>
  )
}

export default TeamHealthScoreScale
