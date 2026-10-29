import plural from '../../utils/plural'
import ReportTeamHealthMark from './ReportTeamHealthMark'
import type {ReportTeamHealthCell} from './reportTeamHealthCells'
import {TEAM_HEALTH_MARK_NAMES, TEAM_HEALTH_MARK_ORDER} from './reportTeamHealthWords'

interface Props {
  shownCells: ReportTeamHealthCell[]
  hasTeamRows: boolean
}

const ReportTeamHealthSummary = ({shownCells, hasTeamRows}: Props) => {
  if (!hasTeamRows) {
    return (
      <p className='m-0 text-fg-secondary text-sm'>
        Attention goes on each team’s cells. Add Team to the rows to see which teams need it.
      </p>
    )
  }
  const countOf = (mark: (typeof TEAM_HEALTH_MARK_ORDER)[number]) =>
    shownCells.filter((cell) => cell.mark === mark).length
  const shownMarks = TEAM_HEALTH_MARK_ORDER.filter((mark) => countOf(mark) > 0)
  if (shownMarks.length === 0) {
    return (
      <p className='m-0 text-fg-secondary text-sm'>
        No cells need attention, and none stand out as bright spots.
      </p>
    )
  }
  const levels = shownMarks.filter((mark) => mark !== 'BRIGHT_SPOT')
  const attentionCount = levels.reduce((sum, level) => sum + countOf(level), 0)
  const brightCount = countOf('BRIGHT_SPOT')
  const ofCells = `of ${shownCells.length} ${plural(shownCells.length, 'cell')}`
  const attentionPart =
    attentionCount > 0 &&
    `${attentionCount} ${ofCells} ${attentionCount === 1 ? 'needs' : 'need'} attention (${levels
      .map((level) => `${countOf(level)} ${TEAM_HEALTH_MARK_NAMES[level].toLowerCase()}`)
      .join(', ')})`
  const brightPart =
    brightCount > 0 &&
    `${brightCount}${attentionPart ? '' : ` ${ofCells}`} ${brightCount === 1 ? 'is a bright spot' : 'are bright spots'}`
  const sentence = [attentionPart, brightPart].filter(Boolean).join(', and ')
  return (
    <p className='m-0 text-sm leading-5'>
      <span className='mr-2 inline-flex gap-0.5 align-[-4px]'>
        {shownMarks.map((mark) => (
          <ReportTeamHealthMark key={mark} mark={mark} />
        ))}
      </span>
      <strong className='font-semibold'>{sentence}.</strong> Hover one for why.
    </p>
  )
}

export default ReportTeamHealthSummary
