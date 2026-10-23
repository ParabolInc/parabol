import type {TeamHealthMark} from '../../shared/reports/teamHealthAttention'
import {cn} from '../../ui/cn'
import describeTeamHealthAttention from './describeTeamHealthAttention'
import ReportTeamHealthDriver from './ReportTeamHealthDriver'
import ReportTeamHealthMark from './ReportTeamHealthMark'
import ReportTeamHealthMarksInfo from './ReportTeamHealthMarksInfo'
import type {ReportTeamHealthCell} from './reportTeamHealthCells'

interface Props {
  cell: ReportTeamHealthCell
  markedCount: number
}

const WASHES: Record<TeamHealthMark, string> = {
  HIGH: 'bg-tomato-800/8 dark:bg-tomato-600/18',
  MEDIUM: 'bg-terra-500/10 dark:bg-terra-300/14',
  LOW: 'bg-gold-400/16 dark:bg-gold-200/14',
  BRIGHT_SPOT: 'bg-jade-500/12 dark:bg-jade-300/12'
}

const ReportTeamHealthAttention = ({cell, markedCount}: Props) => {
  const {mark, inputs, category} = cell
  const {shownMark, title, score, sentence, footnote} = describeTeamHealthAttention(
    cell,
    markedCount
  )
  return (
    <section
      aria-label='Attention'
      className={cn(
        'flex flex-col gap-2.5 rounded-lg px-3.5 py-3',
        mark ? WASHES[mark] : 'bg-surface-raised'
      )}
    >
      <div className='flex items-center gap-2'>
        {shownMark && (
          <ReportTeamHealthMark
            mark={shownMark}
            className={cn('size-[22px]', !mark && 'opacity-50')}
          />
        )}
        <strong className='flex-1 font-semibold text-[15px] leading-5'>{title}</strong>
        <span
          className={cn('font-semibold text-[15px] tabular-nums', !mark && 'text-fg-secondary')}
        >
          {score}
        </span>
      </div>
      <span className='text-[13px] text-fg-secondary leading-[19px]'>{sentence}</span>
      <div className='flex flex-col gap-2'>
        {inputs.map((input) => (
          <ReportTeamHealthDriver
            key={input.key}
            input={input}
            category={category}
            isBrightSpot={shownMark === 'BRIGHT_SPOT'}
          />
        ))}
      </div>
      <span className='text-fg-muted text-xs leading-4'>
        {footnote && `${footnote} `}
        <ReportTeamHealthMarksInfo />
      </span>
    </section>
  )
}

export default ReportTeamHealthAttention
