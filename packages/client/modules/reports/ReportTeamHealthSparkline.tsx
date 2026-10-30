import {cn} from '../../ui/cn'
import {formatReportValue} from './formatReportValue'
import {healthAnswerColorOf} from './reportHeatmapShades'
import {formatCheckDate} from './reportTeamHealthWords'

interface Props {
  scoreHistory: readonly {readonly endedAt: string; readonly score: number}[]
  label: string
}

const WIDTH = 132
const HEIGHT = 40
const INSET = 8

// The y range hugs the scores, half a point past each end, so a small change still shows. A hairline marks neutral
const ReportTeamHealthSparkline = ({scoreHistory, label}: Props) => {
  const scores = scoreHistory.map(({score}) => score)
  const low = Math.max(1, Math.min(...scores) - 0.5)
  const high = Math.min(5, Math.max(...scores) + 0.5)
  const xOf = (idx: number) => INSET + (idx * (WIDTH - 2 * INSET)) / Math.max(1, scores.length - 1)
  const yOf = (score: number) => 6 + ((high - score) / (high - low)) * (HEIGHT - 12)
  const lastIdx = scores.length - 1
  return (
    <figure className='m-0 ml-auto flex flex-col items-end gap-0.5'>
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role='img'
        aria-label={label}
      >
        {low <= 3 && high >= 3 && (
          <line
            x1='0'
            x2={WIDTH}
            y1={yOf(3)}
            y2={yOf(3)}
            strokeWidth='1'
            className='stroke-hairline'
          />
        )}
        <polyline
          points={scores.map((score, idx) => `${xOf(idx)},${yOf(score)}`).join(' ')}
          fill='none'
          strokeWidth='2'
          strokeLinejoin='round'
          strokeLinecap='round'
          className='stroke-fg-muted'
        />
        {scores.map((score, idx) => (
          <circle
            key={idx}
            cx={xOf(idx)}
            cy={yOf(score)}
            r={idx === lastIdx ? 5 : 4}
            strokeWidth='2'
            className={cn(
              'stroke-surface-card',
              idx === lastIdx ? healthAnswerColorOf(score).dot : 'fill-fg-muted'
            )}
          />
        ))}
      </svg>
      <figcaption className='whitespace-nowrap text-fg-muted text-xs'>
        {scores.map((score) => formatReportValue('HEALTH_SCORE', score)).join(' → ')} since{' '}
        {formatCheckDate(scoreHistory[0]!.endedAt)}
      </figcaption>
    </figure>
  )
}

export default ReportTeamHealthSparkline
