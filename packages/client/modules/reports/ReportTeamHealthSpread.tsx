import {MIN_RESPONDENTS_FOR_DETAILS} from '../../shared/utils/teamHealthAnonymity'
import {cn} from '../../ui/cn'
import {HEALTH_SCORE_SHADES, healthAnswerColorOf} from './reportHeatmapShades'

interface Props {
  spreadScores: readonly number[] | null | undefined
  respondentCount: number
}

const HEADING_CLASS_NAME = 'm-0 font-semibold text-fg-muted text-xs uppercase tracking-wide'

const ReportTeamHealthSpread = ({spreadScores, respondentCount}: Props) => {
  if (!spreadScores) {
    return (
      <section className='flex flex-col gap-1'>
        <h3 className={HEADING_CLASS_NAME}>How {respondentCount} people answered</h3>
        <p className='m-0 text-fg-secondary text-sm'>
          The spread shows once {MIN_RESPONDENTS_FOR_DETAILS} people answer, so no answer can be
          matched to a person.
        </p>
      </section>
    )
  }
  const counts = HEALTH_SCORE_SHADES.map(
    (_, idx) => spreadScores.filter((score) => score === idx + 1).length
  )
  const disagreeCount = counts[0]! + counts[1]!
  const agreeCount = counts[3]! + counts[4]!
  const spreadLabel = HEALTH_SCORE_SHADES.map(
    ({label}, idx) => `${counts[idx]} ${label.toLowerCase()}`
  ).join(', ')
  return (
    <section className='flex flex-col gap-2'>
      <div className='flex items-baseline justify-between gap-2'>
        <h3 className={HEADING_CLASS_NAME}>How {spreadScores.length} people answered</h3>
        <span className='text-fg-muted text-xs'>
          {disagreeCount} disagree · {agreeCount} agree
        </span>
      </div>
      <div
        role='img'
        aria-label={`How ${spreadScores.length} people answered: ${spreadLabel}`}
        className='flex flex-col gap-1.5'
      >
        {HEALTH_SCORE_SHADES.map(({label}, idx) => (
          <div
            key={label}
            className='grid grid-cols-[112px_minmax(0,1fr)_20px] items-center gap-2 text-[13px] leading-4'
          >
            <span className='text-fg-secondary'>{label}</span>
            <span className='flex h-3.5'>
              <span
                className={cn('rounded-r', healthAnswerColorOf(idx + 1).bar)}
                style={{width: `${(counts[idx]! / spreadScores.length) * 100}%`}}
              />
            </span>
            <span className='text-right font-semibold tabular-nums'>{counts[idx]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ReportTeamHealthSpread
