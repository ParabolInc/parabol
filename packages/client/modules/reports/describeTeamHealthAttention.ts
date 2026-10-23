import {
  BRIGHT_SPOT_SENTIMENT,
  MIN_TEAM_HEALTH_ATTENTION,
  type TeamHealthMark,
  toTeamHealthAttentionLevel
} from '../../shared/reports/teamHealthAttention'
import type {ReportTeamHealthCell} from './reportTeamHealthCells'
import {describeReadings, formatSentiment, TEAM_HEALTH_MARK_NAMES} from './reportTeamHealthWords'

const CAP_NOTE = 'No more than 1 cell in 5 is marked, bright spots included.'
const NO_ROOM = 'Not marked: no room left'

// a cell the cap held back says so, since its readings alone would mark it
const describeTeamHealthAttention = (cell: ReportTeamHealthCell, markedCount: number) => {
  const {mark, attention, rawAttention, category} = cell
  const sentimentScore = category.sentimentScore ?? null
  const isBright = sentimentScore !== null && sentimentScore >= BRIGHT_SPOT_SENTIMENT
  const heldMark: TeamHealthMark | null = mark
    ? null
    : rawAttention >= MIN_TEAM_HEALTH_ATTENTION
      ? toTeamHealthAttentionLevel(rawAttention)
      : isBright
        ? 'BRIGHT_SPOT'
        : null
  const markedNote = `One of ${markedCount} marked ${markedCount === 1 ? 'cell' : 'cells'}. ${CAP_NOTE}`
  const sentiment = formatSentiment(sentimentScore ?? 0)
  if (mark === 'BRIGHT_SPOT') {
    return {
      shownMark: mark,
      title: 'Bright spot',
      score: sentiment,
      sentence:
        'The summary reads overwhelmingly positive. Worth sharing with the team, or asking what’s working so other teams can borrow it.',
      footnote: markedNote
    }
  }
  if (mark) {
    return {
      shownMark: mark,
      title: `Needs attention · ${TEAM_HEALTH_MARK_NAMES[mark]}`,
      score: attention.toFixed(2),
      sentence: describeReadings(cell),
      footnote: markedNote
    }
  }
  if (heldMark === 'BRIGHT_SPOT') {
    return {
      shownMark: heldMark,
      title: NO_ROOM,
      score: sentiment,
      sentence:
        'Overwhelmingly positive too, but the report already shows as many marks as it allows, and cells that need attention come first.',
      footnote: 'It shows once fewer cells need attention or a stronger bright spot drops out.'
    }
  }
  if (heldMark) {
    return {
      shownMark: heldMark,
      title: NO_ROOM,
      score: rawAttention.toFixed(2),
      sentence: `${describeReadings(cell)} That’s enough for a mark, but the report already shows as many as it allows, and stronger cells come first.`,
      footnote: 'It shows once fewer cells need attention.'
    }
  }
  return {
    shownMark: null,
    title: category.isLoadingSummary ? 'Not marked so far' : 'Not marked',
    score: attention.toFixed(2),
    sentence: category.isLoadingSummary
      ? 'Scored on the spread and the comments for now. The score updates, and a bright spot can appear, when the summary arrives.'
      : describeReadings(cell),
    footnote: null
  }
}

export default describeTeamHealthAttention
