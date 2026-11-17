import {useId} from 'react'
import type {TeamHealthMark} from '../../shared/reports/teamHealthAttention'
import {cn} from '../../ui/cn'
import ReportTeamHealthDriver from './ReportTeamHealthDriver'
import ReportTeamHealthMark from './ReportTeamHealthMark'
import type {ReportTeamHealthCell} from './reportTeamHealthCells'
import {describeReadings, TEAM_HEALTH_MARK_NAMES} from './reportTeamHealthWords'

interface Props {
  cell: ReportTeamHealthCell
}

const WASHES: Record<TeamHealthMark, string> = {
  HIGH: 'bg-tomato-800/8 dark:bg-tomato-600/18',
  MEDIUM: 'bg-terra-500/10 dark:bg-terra-300/14',
  LOW: 'bg-gold-400/16 dark:bg-gold-200/14',
  BRIGHT_SPOT: 'bg-jade-500/12 dark:bg-jade-300/12'
}

// Why a marked cell has its mark. A bright spot comes from the summary alone, so it shows only that
const ReportTeamHealthAttention = ({cell}: Props) => {
  const headingId = useId()
  const {mark, inputs, stage} = cell
  if (!mark) return null
  const isBrightSpot = mark === 'BRIGHT_SPOT'
  const shownInputs = isBrightSpot ? inputs.filter(({key}) => key === 'sentiment') : inputs
  return (
    <section
      aria-labelledby={headingId}
      className={cn('flex flex-col gap-2.5 rounded-lg px-3.5 py-3', WASHES[mark])}
    >
      <div className='flex items-center gap-2'>
        <ReportTeamHealthMark mark={mark} className='size-[22px]' />
        <h3 id={headingId} className='m-0 font-semibold text-[15px] leading-5'>
          {isBrightSpot ? 'Bright spot' : `Needs attention · ${TEAM_HEALTH_MARK_NAMES[mark]}`}
        </h3>
      </div>
      <p className='m-0 text-[13px] text-fg-secondary leading-[19px]'>
        {isBrightSpot
          ? 'The summary reads overwhelmingly positive. Worth sharing with the team, or asking what’s working so other teams can borrow it.'
          : describeReadings(cell)}
      </p>
      <div className='flex flex-col gap-2'>
        {shownInputs.map((input) => (
          <ReportTeamHealthDriver
            key={input.key}
            input={input}
            stage={stage}
            isBrightSpot={isBrightSpot}
          />
        ))}
      </div>
      <p className='m-0 text-fg-muted text-xs leading-4'>
        No more than 1 cell in 5 is marked, so only the ones that stand out most get a mark.
      </p>
    </section>
  )
}

export default ReportTeamHealthAttention
