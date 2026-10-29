import plural from '../../utils/plural'
import ReportTeamHealthMark from './ReportTeamHealthMark'
import type {ReportTeamHealthCell} from './reportTeamHealthCells'
import {TEAM_HEALTH_MARK_ORDER} from './reportTeamHealthWords'

interface Props {
  shownCells: ReportTeamHealthCell[]
  hasTeamRows: boolean
}

const ReportTeamHealthSummary = ({shownCells, hasTeamRows}: Props) => {
  if (!hasTeamRows) {
    return (
      <p className='m-0 text-fg-secondary text-sm'>
        Add Team to the rows to see which teams need attention
      </p>
    )
  }
  const countOf = (mark: (typeof TEAM_HEALTH_MARK_ORDER)[number]) =>
    shownCells.filter((cell) => cell.mark === mark).length
  const shownMarks = TEAM_HEALTH_MARK_ORDER.filter((mark) => countOf(mark) > 0)
  if (shownMarks.length === 0) {
    return <p className='m-0 text-fg-secondary text-sm'>No cells need attention</p>
  }
  const levels = shownMarks.filter((mark) => mark !== 'BRIGHT_SPOT')
  const attentionCount = levels.reduce((sum, level) => sum + countOf(level), 0)
  const brightCount = countOf('BRIGHT_SPOT')
  // bright spots are only named when no cell needs attention
  const namedMarks = attentionCount > 0 ? levels : shownMarks
  return (
    <p className='m-0 font-semibold text-sm leading-5'>
      <span className='mr-2 inline-flex gap-0.5 align-[-4px]'>
        {namedMarks.map((mark) => (
          <ReportTeamHealthMark key={mark} mark={mark} />
        ))}
      </span>
      {attentionCount > 0
        ? `${attentionCount} ${plural(attentionCount, 'cell')} ${attentionCount === 1 ? 'needs' : 'need'} attention`
        : `${brightCount} ${plural(brightCount, 'bright spot')}`}
    </p>
  )
}

export default ReportTeamHealthSummary
