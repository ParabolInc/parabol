import type {TeamHealthMark} from '../../shared/reports/teamHealthAttention'
import {cn} from '../../ui/cn'

const MARK_CLASSES: Record<TeamHealthMark, {circle: string; glyph: string}> = {
  LOW: {
    circle: 'fill-gold-400 stroke-gold-600 dark:fill-gold-200 dark:stroke-gold-200',
    glyph: 'fill-slate-800'
  },
  MEDIUM: {
    circle: 'fill-terra-500 stroke-terra-500 dark:fill-terra-300 dark:stroke-terra-300',
    glyph: 'fill-white dark:fill-slate-800'
  },
  HIGH: {
    circle: 'fill-tomato-800 stroke-tomato-800 dark:fill-tomato-600 dark:stroke-tomato-600',
    glyph: 'fill-white'
  },
  BRIGHT_SPOT: {
    circle: 'fill-surface-card stroke-jade-600 dark:stroke-jade-300',
    glyph: 'fill-jade-600 dark:fill-jade-300'
  }
}

interface Props {
  mark: TeamHealthMark
  className?: string
}

// a bright spot is a ring rather than a filled circle, so color alone never tells it apart
const ReportTeamHealthMark = ({mark, className}: Props) => {
  const isBrightSpot = mark === 'BRIGHT_SPOT'
  const {circle, glyph} = MARK_CLASSES[mark]
  return (
    <svg viewBox='0 0 20 20' aria-hidden='true' className={cn('size-[18px] shrink-0', className)}>
      <circle
        cx='10'
        cy='10'
        r={isBrightSpot ? 8.5 : 8.75}
        strokeWidth={isBrightSpot ? 2 : 1.5}
        className={circle}
      />
      <path d='M9 4.75h2v6.75H9zm0 8.25h2v2.1H9z' className={glyph} />
    </svg>
  )
}

export default ReportTeamHealthMark
