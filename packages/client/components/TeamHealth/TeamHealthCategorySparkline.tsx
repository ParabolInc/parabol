import {cn} from '../../ui/cn'

interface Props {
  // one entry per completed cycle that scored this category, oldest first. score is the 1-5 mean
  points: ReadonlyArray<{meetingId: string; name: string; score: number}>
  // the category's own color, so the bars carry the same identity as the tile's pill
  barClassName: string
  className?: string
}

// Small multiples: one chart per card, a single series each, so the card's pill names the series
// and no legend is needed. Bars rather than a line because they survive the card resizing without
// distorting.
//
// A Likert scale has no zero, so the bars span the range the answers can actually occupy: 1 is an
// empty bar and 5 is a full one. Anchoring at zero instead would spend the bottom fifth of every
// chart on a score nobody can give, and flatten the differences that matter.
const SCALE_MIN = 1
const SCALE_MAX = 5
const barHeight = (score: number) => ((score - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100
const TeamHealthCategorySparkline = (props: Props) => {
  const {points, barClassName, className} = props
  // a single point is a dot, not a trend
  if (points.length < 2) return null
  const latestIdx = points.length - 1

  return (
    <div className={cn('flex h-8 items-end gap-0.5', className)} aria-hidden>
      {points.map((point, idx) => (
        <div key={point.meetingId} className='flex h-full flex-1 items-end'>
          <div
            title={`${point.name}: ${point.score.toFixed(1)} of 5`}
            className={cn(
              'w-full rounded-t-sm',
              barClassName,
              idx === latestIdx ? 'opacity-100' : 'opacity-40'
            )}
            // a bottom-of-scale cycle still needs a sliver of bar, or it reads as never having
            // happened at all
            style={{height: `${Math.max(barHeight(point.score), 3)}%`}}
          />
        </div>
      ))}
    </div>
  )
}

export default TeamHealthCategorySparkline
