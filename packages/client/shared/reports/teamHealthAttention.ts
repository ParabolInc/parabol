// How each team's category in its latest Team Health check earns a mark on the heatmap: an attention
// level from its attention score, or a bright spot from an overwhelmingly positive summary

export type TeamHealthAttentionLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type TeamHealthMark = TeamHealthAttentionLevel | 'BRIGHT_SPOT'
export type TeamHealthAttentionInputKey = 'sentiment' | 'spread' | 'commented'

export const TEAM_HEALTH_ATTENTION_WEIGHTS: Record<TeamHealthAttentionInputKey, number> = {
  sentiment: 0.5,
  spread: 0.25,
  commented: 0.25
}
// a standard deviation of the 1 to 5 answers at the low end adds nothing, at the high end all it can
const SPREAD_RANGE = [0.6, 1.4] as const
// the share of people who commented, the same way
const COMMENTED_RANGE = [0.1, 0.6] as const
export const MIN_TEAM_HEALTH_ATTENTION = 0.5
export const TEAM_HEALTH_ATTENTION_LEVELS = [
  {level: 'HIGH', min: 0.9},
  {level: 'MEDIUM', min: 0.75},
  {level: 'LOW', min: MIN_TEAM_HEALTH_ATTENTION}
] as const satisfies readonly {level: TeamHealthAttentionLevel; min: number}[]
export const BRIGHT_SPOT_SENTIMENT = 0.8
const MAX_MARKED_SHARE = 0.2

export interface TeamHealthAttentionReadings {
  // -1 to 1, or null with no summary
  sentimentScore: number | null
  // null below the respondents a spread needs
  deviation: number | null
  commentedShare: number
}

export interface TeamHealthAttentionInput {
  key: TeamHealthAttentionInputKey
  weight: number
  // what the input adds, from 0 to 1, or null when it's missing
  value: number | null
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const scaleBetween = (value: number, [low, high]: readonly [number, number]) =>
  clamp01((value - low) / (high - low))

// only a negative summary counts toward attention
export const toTeamHealthAttentionInputs = ({
  sentimentScore,
  deviation,
  commentedShare
}: TeamHealthAttentionReadings): TeamHealthAttentionInput[] => [
  {
    key: 'sentiment',
    weight: TEAM_HEALTH_ATTENTION_WEIGHTS.sentiment,
    value: sentimentScore === null ? null : clamp01(-sentimentScore)
  },
  {
    key: 'spread',
    weight: TEAM_HEALTH_ATTENTION_WEIGHTS.spread,
    value: deviation === null ? null : scaleBetween(deviation, SPREAD_RANGE)
  },
  {
    key: 'commented',
    weight: TEAM_HEALTH_ATTENTION_WEIGHTS.commented,
    value: scaleBetween(commentedShare, COMMENTED_RANGE)
  }
]

// A missing input hands its weight to the ones that are there. The share who commented never scores a cell alone,
// since it says how much people had to say, not whether it was good or bad
export const combineTeamHealthAttention = (inputs: readonly TeamHealthAttentionInput[]) => {
  const used = inputs.filter(({value}) => value !== null)
  if (used.every(({key}) => key === 'commented')) return 0
  const totalWeight = used.reduce((sum, {weight}) => sum + weight, 0)
  return used.reduce((sum, {weight, value}) => sum + weight * value!, 0) / totalWeight
}

export const toTeamHealthDeviation = (scores: readonly number[]) => {
  if (scores.length === 0) return 0
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + (score - mean) ** 2, 0) / scores.length
  return Math.sqrt(variance)
}

export const toTeamHealthAttentionLevel = (attention: number) =>
  TEAM_HEALTH_ATTENTION_LEVELS.find(({min}) => attention >= min)?.level ?? null

export interface TeamHealthMarkCandidate {
  rawAttention: number
  sentimentScore: number | null
  commentedShare: number
}

// No more than 1 cell in 5 is marked. Cells that need attention take the room first, strongest first, and
// bright spots fill what's left, most positive first. When more cells need attention than there's room
// for, every score is squeezed, keeping its order, until only the marked ones stay at 0.5 or above. The cap
// never raises a score, so a calm report shows no marks
export const markTeamHealthCells = <Cell extends TeamHealthMarkCandidate>(
  cells: readonly Cell[]
) => {
  const room = Math.floor(cells.length * MAX_MARKED_SHARE)
  const needAttention = cells
    .filter(({rawAttention}) => rawAttention >= MIN_TEAM_HEALTH_ATTENTION)
    .sort(
      (a, b) =>
        b.rawAttention - a.rawAttention ||
        (a.sentimentScore ?? 0) - (b.sentimentScore ?? 0) ||
        b.commentedShare - a.commentedShare
    )
  const marked = new Set<Cell>(needAttention.slice(0, room))
  const isSqueezed = needAttention.length > room
  const line = !isSqueezed
    ? 0
    : room === 0
      ? needAttention[0]!.rawAttention
      : (needAttention[room - 1]!.rawAttention + needAttention[room]!.rawAttention) / 2
  const squeeze = (raw: number) => {
    if (!isSqueezed) return raw
    if (raw > line) return 0.5 + (0.5 * (raw - line)) / Math.max(1 - line, Number.EPSILON)
    return (0.5 * raw) / Math.max(line, Number.EPSILON)
  }
  const brightRoom = room - marked.size
  const brightSpots = new Set<Cell>(
    cells
      .filter(
        (cell) =>
          !marked.has(cell) &&
          cell.sentimentScore !== null &&
          cell.sentimentScore >= BRIGHT_SPOT_SENTIMENT
      )
      .sort((a, b) => b.sentimentScore! - a.sentimentScore! || b.commentedShare - a.commentedShare)
      .slice(0, Math.max(0, brightRoom))
  )
  return cells.map((cell) => {
    const squeezed = squeeze(cell.rawAttention)
    const attention = marked.has(cell)
      ? Math.max(squeezed, MIN_TEAM_HEALTH_ATTENTION)
      : Math.min(squeezed, MIN_TEAM_HEALTH_ATTENTION - 0.01)
    const mark: TeamHealthMark | null = marked.has(cell)
      ? toTeamHealthAttentionLevel(attention)
      : brightSpots.has(cell)
        ? 'BRIGHT_SPOT'
        : null
    return {cell, attention, mark}
  })
}
